using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Quotations;

public class GetQuotationByIdQuery(Guid id) : IRequest<ApiResponse<QuotationDetailDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetQuotationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetQuotationByIdQuery, ApiResponse<QuotationDetailDto>>
{
    public async Task<ApiResponse<QuotationDetailDto>> Handle(GetQuotationByIdQuery request, CancellationToken cancellationToken)
    {
        var q = await unitOfWork.Quotations.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (q == null)
            return ApiResponse<QuotationDetailDto>.ErrorResponse("Quotation not found.");

        var result = new QuotationDetailDto
        {
            Id = q.Id,
            ReferenceNo = q.ReferenceNo,
            CustomerId = q.CustomerId,
            CustomerName = q.Customer.Name,
            QuotationDate = q.QuotationDate,
            ExpiryDate = q.ExpiryDate,
            TotalAmount = q.TotalAmount,
            Discount = q.Discount,
            Status = q.Status,
            Note = q.Note,
            Items = q.QuotationItems.Select(qi => new QuotationItemDetailDto
            {
                ProductId = qi.ProductId,
                ProductName = qi.Product.Name,
                Quantity = qi.Quantity,
                UnitPrice = qi.UnitPrice,
                SubTotal = qi.SubTotal
            }).ToList()
        };

        return ApiResponse<QuotationDetailDto>.SuccessResponse(result);
    }
}
