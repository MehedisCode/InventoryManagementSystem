using MediatR;
using IMS.Domain.Enums;
using IMS.Application.Common;
using IMS.Application.Interfaces;

namespace IMS.Application.Features.Quotations;

public class GetExpiredQuotationsQuery : IRequest<ApiResponse<List<QuotationListDto>>>;

public class GetExpiredQuotationsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetExpiredQuotationsQuery, ApiResponse<List<QuotationListDto>>>
{
    public async Task<ApiResponse<List<QuotationListDto>>> Handle(GetExpiredQuotationsQuery request, CancellationToken cancellationToken)
    {
        var quotations = await unitOfWork.Quotations.GetAllWithCustomersAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var expired = quotations
            .Where(q => q.ExpiryDate < now && (q.Status == QuotationStatus.Draft || q.Status == QuotationStatus.Sent))
            .Select(q => new QuotationListDto
            {
                Id = q.Id,
                ReferenceNo = q.ReferenceNo,
                CustomerName = q.Customer.Name,
                QuotationDate = q.QuotationDate,
                ExpiryDate = q.ExpiryDate,
                TotalAmount = q.TotalAmount,
                Status = q.Status
            }).ToList();

        return ApiResponse<List<QuotationListDto>>.SuccessResponse(expired);
    }
}

