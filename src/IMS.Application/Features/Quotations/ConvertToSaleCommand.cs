using MediatR;
using IMS.Domain.Enums;
using IMS.Domain.Entities;
using IMS.Domain.Exceptions;
using IMS.Application.Common;
using IMS.Application.Interfaces;

namespace IMS.Application.Features.Quotations;

public class ConvertToSaleCommand(Guid quotationId) : IRequest<ApiResponse<Guid>>
{
    public Guid QuotationId { get; set; } = quotationId;
}

public class ConvertToSaleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<ConvertToSaleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(ConvertToSaleCommand request, CancellationToken cancellationToken)
    {
        var quotation = await unitOfWork.Quotations.GetByIdWithDetailsAsync(request.QuotationId, cancellationToken);
        if (quotation == null)
            throw new NotFoundException("Quotation not found.", "ID");

        if (quotation.Status == QuotationStatus.Accepted)
            throw new BusinessRuleException("Quotation is already accepted and converted.");

        // Load products for stock decrease
        var productIds = quotation.QuotationItems.Select(i => i.ProductId).Distinct().ToList();
        var productsList = await unitOfWork.Products.GetAsync(p => productIds.Contains(p.Id), cancellationToken);
        var products = productsList.ToDictionary(p => p.Id);

        // Validate stock availability
        foreach (var item in quotation.QuotationItems)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
                throw new BusinessRuleException($"Product with ID {item.ProductId} not found.");

            if (product.StockQuantity < item.Quantity)
                return ApiResponse<Guid>.ErrorResponse(
                    $"Insufficient stock for product '{product.Name}'. " +
                    $"Available: {product.StockQuantity}, " +
                    $"Requested: {item.Quantity}.");
        }

        var saleItems = new List<SaleItem>();
        foreach (var item in quotation.QuotationItems)
        {
            var product = products[item.ProductId];

            saleItems.Add(new SaleItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                SubTotal = item.SubTotal
            });

            // Decrease stock
            product.StockQuantity -= item.Quantity;
            await unitOfWork.Products.UpdateAsync(product, cancellationToken);
        }

        var today = DateTime.UtcNow;
        var count = await unitOfWork.Sales.CountAsync(s => s.CreatedAt.Date == today.Date, cancellationToken);
        var referenceNo = $"SAL-{today:yyyyMMdd}-{(count + 1):D4}";

        var dueAmount = quotation.TotalAmount - quotation.Discount;

        var sale = new Sale
        {
            CustomerId = quotation.CustomerId,
            ReferenceNo = referenceNo,
            SaleDate = DateTime.UtcNow,
            TotalAmount = quotation.TotalAmount,
            Discount = quotation.Discount,
            PaidAmount = 0,
            DueAmount = dueAmount,
            Note = $"Generated from Quotation: {quotation.ReferenceNo}",
            Status = SaleStatus.Pending,
            SaleItems = saleItems
        };

        quotation.Status = QuotationStatus.Accepted;

        await unitOfWork.Sales.AddAsync(sale, cancellationToken);
        await unitOfWork.Quotations.UpdateAsync(quotation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(sale.Id, "Quotation successfully converted to Sale.");
    }
}

