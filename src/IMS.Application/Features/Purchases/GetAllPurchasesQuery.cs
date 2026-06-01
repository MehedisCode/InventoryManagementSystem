using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Purchases;

public class GetAllPurchasesQuery : IRequest<ApiResponse<List<PurchaseListDto>>>;

public class GetAllPurchasesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllPurchasesQuery, ApiResponse<List<PurchaseListDto>>>
{
    public async Task<ApiResponse<List<PurchaseListDto>>> Handle(GetAllPurchasesQuery request, CancellationToken cancellationToken)
    {
        var purchases = await unitOfWork.Purchases.GetAllWithSuppliersAsync(cancellationToken);

        var result = purchases.Select(p => new PurchaseListDto
        {
            Id = p.Id,
            ReferenceNo = p.ReferenceNo,
            SupplierName = p.Supplier.Name,
            PurchaseDate = p.PurchaseDate,
            TotalAmount = p.TotalAmount,
            PaidAmount = p.PaidAmount,
            DueAmount = p.DueAmount,
            Status = p.Status
        }).ToList();

        return ApiResponse<List<PurchaseListDto>>.SuccessResponse(result);
    }
}
