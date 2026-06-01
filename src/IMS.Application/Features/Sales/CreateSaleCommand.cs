using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Sales;

public class CreateSaleCommand : IRequest<ApiResponse<Guid>>
{
    public Guid CustomerId { get; set; }
    public DateTime SaleDate { get; set; }
    public decimal Discount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Note { get; set; } = string.Empty;
    public SaleStatus Status { get; set; }
    public List<SaleItemInputDto> Items { get; set; } = [];
}

public class CreateSaleCommandValidator : AbstractValidator<CreateSaleCommand>
{
    public CreateSaleCommandValidator()
    {
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

public class CreateSaleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateSaleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSaleCommand request, CancellationToken cancellationToken)
    {
        // Validate customer exists
        var customer = await unitOfWork.Customers.GetByIdAsync(request.CustomerId, cancellationToken);
        if (customer == null)
            return ApiResponse<Guid>.ErrorResponse("Customer not found.");

        // Load all required products
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var productsList = await unitOfWork.Products.GetAsync(p => productIds.Contains(p.Id), cancellationToken);
        var products = productsList.ToDictionary(p => p.Id);

        // Validate stock availability
        foreach (var itemDto in request.Items)
        {
            if (!products.TryGetValue(itemDto.ProductId, out var product))
                return ApiResponse<Guid>.ErrorResponse($"Product with ID {itemDto.ProductId} not found.");

            if (product.StockQuantity < itemDto.Quantity)
                return ApiResponse<Guid>.ErrorResponse(
                    $"Insufficient stock for product '{product.Name}'. Available: {product.StockQuantity}, Requested: {itemDto.Quantity}.");
        }

        // Build sale items and calculate totals
        var totalAmount = 0m;
        var saleItems = new List<SaleItem>();

        foreach (var itemDto in request.Items)
        {
            var product = products[itemDto.ProductId];
            var subTotal = itemDto.Quantity * itemDto.UnitPrice;
            totalAmount += subTotal;

            saleItems.Add(new SaleItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                SubTotal = subTotal
            });

            // Decrease stock
            product.StockQuantity -= itemDto.Quantity;
            await unitOfWork.Products.UpdateAsync(product, cancellationToken);
        }

        // Generate ReferenceNo
        var today = DateTime.UtcNow;
        var count = await unitOfWork.Sales.CountAsync(s => s.CreatedAt.Date == today.Date, cancellationToken);
        var referenceNo = $"SAL-{today:yyyyMMdd}-{count + 1:D4}";

        var dueAmount = totalAmount - request.Discount - request.PaidAmount;

        var sale = new Sale
        {
            CustomerId = request.CustomerId,
            ReferenceNo = referenceNo,
            SaleDate = request.SaleDate,
            TotalAmount = totalAmount,
            Discount = request.Discount,
            PaidAmount = request.PaidAmount,
            DueAmount = dueAmount,
            Note = request.Note,
            Status = request.Status,
            SaleItems = saleItems
        };

        await unitOfWork.Sales.AddAsync(sale, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(sale.Id, "Sale created successfully.");
    }
}
