using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Purchases;

public class GetPurchaseByIdQuery(Guid id) : IRequest<ApiResponse<PurchaseDetailDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetPurchaseByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPurchaseByIdQuery, ApiResponse<PurchaseDetailDto>>
{
    public async Task<ApiResponse<PurchaseDetailDto>> Handle(GetPurchaseByIdQuery request, CancellationToken cancellationToken)
    {
        var purchase = await unitOfWork.Purchases.GetByIdWithDetailsAsync(request.Id, cancellationToken);

        if (purchase == null) return ApiResponse<PurchaseDetailDto>.ErrorResponse("Purchase not found.");

        var result = new PurchaseDetailDto
        {
            Id = purchase.Id,
            ReferenceNo = purchase.ReferenceNo,
            SupplierId = purchase.SupplierId,
            SupplierName = purchase.Supplier.Name,
            PurchaseDate = purchase.PurchaseDate,
            TotalAmount = purchase.TotalAmount,
            Discount = purchase.Discount,
            PaidAmount = purchase.PaidAmount,
            DueAmount = purchase.DueAmount,
            Note = purchase.Note,
            Status = purchase.Status,
            Items = purchase.PurchaseItems.Select(pi => new PurchaseItemDetailDto
            {
                ProductId = pi.ProductId,
                ProductName = pi.Product.Name,
                Quantity = pi.Quantity,
                UnitCost = pi.UnitCost,
                SubTotal = pi.SubTotal
            }).ToList()
        };

        return ApiResponse<PurchaseDetailDto>.SuccessResponse(result);
    }
}