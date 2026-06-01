using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Purchases;

public class UpdatePurchaseCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public Guid SupplierId { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal Discount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Note { get; set; } = string.Empty;
    public PurchaseStatus Status { get; set; }
    public List<PurchaseItemDto> Items { get; set; } = [];
}

public class UpdatePurchaseCommandValidator : AbstractValidator<UpdatePurchaseCommand>
{
    public UpdatePurchaseCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.SupplierId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitCost).GreaterThanOrEqualTo(0);
        });
    }
}

public class UpdatePurchaseCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdatePurchaseCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdatePurchaseCommand request, CancellationToken cancellationToken)
    {
        var purchase = await unitOfWork.Purchases.GetByIdWithDetailsAsync(request.Id, cancellationToken);

        if (purchase == null) return ApiResponse<bool>.ErrorResponse("Purchase not found.");

        foreach (var oldItem in purchase.PurchaseItems.ToList())
        {
            var product = await unitOfWork.Products.GetByIdAsync(oldItem.ProductId, cancellationToken);
            if (product != null)
            {
                product.StockQuantity -= oldItem.Quantity;
                await unitOfWork.Products.UpdateAsync(product, cancellationToken);
            }
        }

        // Clear old items
        purchase.PurchaseItems.Clear();

        var totalAmount = 0m;
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var productsList = await unitOfWork.Products.GetAsync(p => productIds.Contains(p.Id), cancellationToken);
        var products = productsList.ToDictionary(p => p.Id);

        foreach (var itemDto in request.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var product))
                return ApiResponse<bool>.ErrorResponse($"Product with ID {itemDto.ProductId} not found.");

            var subTotal = itemDto.Quantity * itemDto.UnitCost;
            totalAmount += subTotal;

            purchase.PurchaseItems.Add(new PurchaseItem
            {
                PurchaseId = purchase.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitCost = itemDto.UnitCost,
                SubTotal = subTotal
            });

            // Apply new stock
            product.StockQuantity += itemDto.Quantity;
            await unitOfWork.Products.UpdateAsync(product, cancellationToken);
        }

        purchase.SupplierId = request.SupplierId;
        purchase.PurchaseDate = request.PurchaseDate;
        purchase.TotalAmount = totalAmount;
        purchase.Discount = request.Discount;
        purchase.PaidAmount = request.PaidAmount;
        purchase.DueAmount = totalAmount - request.Discount - request.PaidAmount;
        purchase.Note = request.Note;
        purchase.Status = request.Status;

        await unitOfWork.Purchases.UpdateAsync(purchase, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Purchase updated successfully.");
    }
}