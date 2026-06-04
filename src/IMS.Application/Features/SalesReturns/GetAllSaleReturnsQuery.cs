using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.SalesReturns;

public class GetAllSaleReturnsQuery : IRequest<ApiResponse<List<SaleReturnListDto>>>;

public class GetAllSaleReturnsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAllSaleReturnsQuery, ApiResponse<List<SaleReturnListDto>>>
{
    public async Task<ApiResponse<List<SaleReturnListDto>>> Handle(GetAllSaleReturnsQuery request, CancellationToken cancellationToken)
    {
        var saleReturns = await unitOfWork.SaleReturns.GetAllWithDetailsAsync(cancellationToken);

        var result = saleReturns.Select(sr => new SaleReturnListDto
        {
            Id = sr.Id,
            ReferenceNo = sr.ReferenceNo,
            SaleReferenceNo = sr.Sale.ReferenceNo,
            CustomerName = sr.Sale.Customer.Name,
            ReturnDate = sr.ReturnDate,
            TotalAmount = sr.TotalAmount,
            Reason = sr.Reason,
            Status = sr.Status
        }).ToList();

        return ApiResponse<List<SaleReturnListDto>>.SuccessResponse(result);
    }
}

