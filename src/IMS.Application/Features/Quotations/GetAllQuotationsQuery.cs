using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Quotations;

public class GetAllQuotationsQuery : IRequest<ApiResponse<List<QuotationListDto>>>;

public class GetAllQuotationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllQuotationsQuery, ApiResponse<List<QuotationListDto>>>
{
    public async Task<ApiResponse<List<QuotationListDto>>> Handle(GetAllQuotationsQuery request, CancellationToken cancellationToken)
    {
        var quotations = await unitOfWork.Quotations.GetAllWithCustomersAsync(cancellationToken);

        var result = quotations.Select(q => new QuotationListDto
        {
            Id = q.Id,
            ReferenceNo = q.ReferenceNo,
            CustomerName = q.Customer.Name,
            QuotationDate = q.QuotationDate,
            ExpiryDate = q.ExpiryDate,
            TotalAmount = q.TotalAmount,
            Status = q.Status
        }).ToList();

        return ApiResponse<List<QuotationListDto>>.SuccessResponse(result);
    }
}
