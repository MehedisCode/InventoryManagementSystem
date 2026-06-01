using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.SalesReturns;

public class CreateSaleReturnCommand : IRequest<ApiResponse<Guid>>
{
    public Guid SaleId { get; set; }
    public DateTime ReturnDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public ReturnStatus Status { get; set; } = ReturnStatus.Pending;
    public List<SaleReturnItemInputDto> Items { get; set; } = new();
}

public class CreateSaleReturnCommandValidator : AbstractValidator<CreateSaleReturnCommand>
{
    public CreateSaleReturnCommandValidator()
    {
        RuleFor(x => x.SaleId).NotEmpty();
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

public class CreateSaleReturnCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateSaleReturnCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSaleReturnCommand request, CancellationToken cancellationToken)
    {
        var sale = await unitOfWork.Sales.GetByIdWithDetailsAsync(request.SaleId, cancellationToken);
        if (sale == null)
            return ApiResponse<Guid>.ErrorResponse("Sale not found.");
        if (sale.Status != SaleStatus.Completed)
            return ApiResponse<Guid>.ErrorResponse("Only completed sales can have returns.");

        // Build a lookup of original sale quantities per product
        var saleQtyByProduct = sale.SaleItems
            .GroupBy(si => si.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(si => si.Quantity));

        // Validate return quantities
        foreach (var item in request.Items)
        {
            if (!saleQtyByProduct.TryGetValue(item.ProductId, out var maxQty))
                return ApiResponse<Guid>.ErrorResponse($"Product {item.ProductId} was not part of this sale.");
            if (item.Quantity > maxQty)
                return ApiResponse<Guid>.ErrorResponse(
                    $"Return quantity ({item.Quantity}) exceeds original sale quantity ({maxQty}) for product {item.ProductId}.");
        }

        // Load products
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var productsList = await unitOfWork.Products.GetAsync(p => productIds.Contains(p.Id), cancellationToken);
        var products = productsList.ToDictionary(p => p.Id);

        // Build return items and increase stock
        var totalAmount = 0m;
        var returnItems = new List<SaleReturnItem>();

        foreach (var itemDto in request.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var product))
                return ApiResponse<Guid>.ErrorResponse($"Product {itemDto.ProductId} not found.");

            var subTotal = itemDto.Quantity * itemDto.UnitPrice;
            totalAmount += subTotal;

            returnItems.Add(new SaleReturnItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                SubTotal = subTotal
            });

            // Increase stock for returned items
            product.StockQuantity += itemDto.Quantity;
            await unitOfWork.Products.UpdateAsync(product, cancellationToken);
        }

        // Generate ReferenceNo
        var today = DateTime.UtcNow;
        var count = await unitOfWork.SaleReturns.CountAsync(r => r.CreatedAt.Date == today.Date, cancellationToken);
        var referenceNo = $"RET-{today:yyyyMMdd}-{(count + 1):D4}";

        var saleReturn = new SaleReturn
        {
            SaleId = request.SaleId,
            ReferenceNo = referenceNo,
            ReturnDate = request.ReturnDate,
            TotalAmount = totalAmount,
            Reason = request.Reason,
            Status = request.Status,
            SaleReturnItems = returnItems
        };

        await unitOfWork.SaleReturns.AddAsync(saleReturn, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(saleReturn.Id, "Sale return created successfully.");
    }
}
