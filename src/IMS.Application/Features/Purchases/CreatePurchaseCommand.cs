using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Purchases;

public class CreatePurchaseCommand : IRequest<ApiResponse<Guid>>
{
    public Guid SupplierId { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal Discount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Note { get; set; } = string.Empty;
    public PurchaseStatus Status { get; set; }
    public List<PurchaseItemDto> Items { get; set; } = [];
}

public class CreatePurchaseCommandValidator : AbstractValidator<CreatePurchaseCommand>
{
    public CreatePurchaseCommandValidator()
    {
        RuleFor(x => x.SupplierId).NotEmpty();
        RuleFor(x => x.PurchaseDate).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("At least one item is required.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitCost).GreaterThanOrEqualTo(0);
        });
    }
}

public class CreatePurchaseCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreatePurchaseCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePurchaseCommand request, CancellationToken cancellationToken)
    {
        var totalAmount = 0m;
        var purchaseItems = new List<PurchaseItem>();
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var productsList = await unitOfWork.Products.GetAsync(p => productIds.Contains(p.Id), cancellationToken);
        var products = productsList.ToDictionary(p => p.Id);

        foreach (var itemDto in request.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var product))
                return ApiResponse<Guid>.ErrorResponse($"Product with ID {itemDto.ProductId} not found.");

            var subTotal = itemDto.Quantity * itemDto.UnitCost;
            totalAmount += subTotal;

            purchaseItems.Add(new PurchaseItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitCost = itemDto.UnitCost,
                SubTotal = subTotal
            });

            // Increase stock
            product.StockQuantity += itemDto.Quantity;
            await unitOfWork.Products.UpdateAsync(product, cancellationToken);
        }

        var dueAmount = totalAmount - request.Discount - request.PaidAmount;

        // Generate Reference No
        var today = DateTime.UtcNow;
        var count = await unitOfWork.Purchases.CountAsync(p => p.CreatedAt.Date == today.Date, cancellationToken);
        var referenceNo = $"PUR-{today:yyyyMMdd}-{count + 1:D4}";

        var purchase = new Purchase
        {
            SupplierId = request.SupplierId,
            ReferenceNo = referenceNo,
            PurchaseDate = request.PurchaseDate,
            TotalAmount = totalAmount,
            Discount = request.Discount,
            PaidAmount = request.PaidAmount,
            DueAmount = dueAmount,
            Note = request.Note,
            Status = request.Status,
            PurchaseItems = purchaseItems
        };

        await unitOfWork.Purchases.AddAsync(purchase, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(purchase.Id, "Purchase created successfully.");
    }
}
