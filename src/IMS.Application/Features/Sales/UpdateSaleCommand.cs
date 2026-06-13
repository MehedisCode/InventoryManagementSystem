using FluentValidation;
using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Sales;

public class UpdateSaleCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public DateTime SaleDate { get; set; }
    public decimal Discount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Note { get; set; } = string.Empty;
    public SaleStatus Status { get; set; }
    public List<SaleItemInputDto> Items { get; set; } = new();
}

public class UpdateSaleCommandValidator : AbstractValidator<UpdateSaleCommand>
{
    public UpdateSaleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.SaleDate).NotEmpty();
        RuleFor(x => x.Discount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PaidAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Items).NotEmpty().WithMessage("Sale must have at least one item.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitPrice).GreaterThan(0);
        });
    }
}

public class UpdateSaleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateSaleCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateSaleCommand request, CancellationToken cancellationToken)
    {
        var sale = await unitOfWork.Sales.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (sale == null)
            throw new NotFoundException("Sale not found.", "ID");

        // Load ALL relevant products in one query (old + new)
        var allProductIds = sale.SaleItems.Select(i => i.ProductId)
            .Union(request.Items.Select(i => i.ProductId))
            .Distinct()
            .ToList();

        var productsList = await unitOfWork.Products.GetAsync(p => allProductIds.Contains(p.Id), cancellationToken);
        var products = productsList.ToDictionary(p => p.Id);

        // Reverse previous stock deductions
        foreach (var oldItem in sale.SaleItems.ToList())
        {
            if (products.TryGetValue(oldItem.ProductId, out var product))
                product.StockQuantity += oldItem.Quantity;
        }

        // Validate new stock
        foreach (var itemDto in request.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var product))
                throw new BusinessRuleException($"Product with ID {itemDto.ProductId} not found.");

            if (product.StockQuantity < itemDto.Quantity)
                throw new BusinessRuleException($"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}, Requested: {itemDto.Quantity}.");
        }

        // Clear old items and build new ones
        sale.SaleItems.Clear();
        var totalAmount = 0m;

        foreach (var itemDto in request.Items)
        {
            var product = products[itemDto.ProductId];
            var subTotal = itemDto.Quantity * itemDto.UnitPrice;
            totalAmount += subTotal;

            sale.SaleItems.Add(new SaleItem
            {
                SaleId = sale.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                SubTotal = subTotal
            });

            product.StockQuantity -= itemDto.Quantity;
        }

        sale.CustomerId = request.CustomerId;
        sale.SaleDate = request.SaleDate;
        sale.TotalAmount = totalAmount;
        sale.Discount = request.Discount;
        sale.PaidAmount = request.PaidAmount;
        sale.DueAmount = totalAmount - request.Discount - request.PaidAmount;
        sale.Note = request.Note;
        sale.Status = request.Status;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Sale updated successfully.");
    }
}

