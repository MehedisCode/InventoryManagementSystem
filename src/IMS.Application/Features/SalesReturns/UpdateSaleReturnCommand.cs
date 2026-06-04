using FluentValidation;
using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.SalesReturns;

public class UpdateSaleReturnCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public DateTime ReturnDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public ReturnStatus Status { get; set; }
    public List<SaleReturnItemInputDto> Items { get; set; } = [];
}

public class UpdateSaleReturnCommandValidator : AbstractValidator<UpdateSaleReturnCommand>
{
    public UpdateSaleReturnCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ReturnDate).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Return must have at least one item.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitPrice).GreaterThan(0);
        });
    }
}

public class UpdateSaleReturnCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateSaleReturnCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateSaleReturnCommand request, CancellationToken cancellationToken)
    {
        var saleReturn = await unitOfWork.SaleReturns.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (saleReturn == null)
            throw new NotFoundException("Sale return not found.", "ID");

        if (saleReturn.Status != ReturnStatus.Pending)
            throw new BusinessRuleException("Only pending returns can be updated.");

        // Reverse previous stock increases
        foreach (var oldItem in saleReturn.SaleReturnItems.ToList())
        {
            var product = await unitOfWork.Products.GetByIdAsync(oldItem.ProductId, cancellationToken);
            if (product != null)
            {
                product.StockQuantity -= oldItem.Quantity;
                await unitOfWork.Products.UpdateAsync(product, cancellationToken);
            }
        }

        // Load new products
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var productsList = await unitOfWork.Products.GetAsync(p => productIds.Contains(p.Id), cancellationToken);
        var products = productsList.ToDictionary(p => p.Id);

        // Validate against original sale quantities
        var sale = await unitOfWork.Sales.GetByIdWithDetailsAsync(saleReturn.SaleId, cancellationToken);
        if (sale != null)
        {
            var saleQtyByProduct = sale.SaleItems
                .GroupBy(si => si.ProductId)
                .ToDictionary(g => g.Key, g => g.Sum(si => si.Quantity));

            foreach (var item in request.Items)
            {
                if (!saleQtyByProduct.TryGetValue(item.ProductId, out var maxQty))
                    throw new BusinessRuleException($"Product {item.ProductId} was not part of the original sale.");
                if (item.Quantity > maxQty)
                    throw new BusinessRuleException($"Return quantity ({item.Quantity}) exceeds original sale quantity ({maxQty}) for product {item.ProductId}.");
            }
        }

        // Rebuild items and apply new stock increases
        saleReturn.SaleReturnItems.Clear();
        var totalAmount = 0m;

        foreach (var itemDto in request.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var product))
                throw new BusinessRuleException($"Product {itemDto.ProductId} not found.");

            var subTotal = itemDto.Quantity * itemDto.UnitPrice;
            totalAmount += subTotal;

            saleReturn.SaleReturnItems.Add(new SaleReturnItem
            {
                SaleReturnId = saleReturn.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                SubTotal = subTotal
            });

            product.StockQuantity += itemDto.Quantity;
            await unitOfWork.Products.UpdateAsync(product, cancellationToken);
        }

        saleReturn.ReturnDate = request.ReturnDate;
        saleReturn.TotalAmount = totalAmount;
        saleReturn.Reason = request.Reason;
        saleReturn.Status = request.Status;

        await unitOfWork.SaleReturns.UpdateAsync(saleReturn, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Sale return updated successfully.");
    }
}

