using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Sales;

public class GetAllSalesQuery : IRequest<ApiResponse<List<SaleListDto>>>;

public class GetAllSalesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllSalesQuery, ApiResponse<List<SaleListDto>>>
{
    public async Task<ApiResponse<List<SaleListDto>>> Handle(GetAllSalesQuery request, CancellationToken cancellationToken)
    {
        var sales = await unitOfWork.Sales.GetAllWithCustomersAsync(cancellationToken);

        var result = sales.Select(s => new SaleListDto
        {
            Id = s.Id,
            ReferenceNo = s.ReferenceNo,
            CustomerName = s.Customer.Name,
            SaleDate = s.SaleDate,
            TotalAmount = s.TotalAmount,
            PaidAmount = s.PaidAmount,
            DueAmount = s.DueAmount,
            Status = s.Status
        }).ToList();

        return ApiResponse<List<SaleListDto>>.SuccessResponse(result);
    }
}
