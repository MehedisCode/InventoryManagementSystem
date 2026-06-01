using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.SalesReturns;

public class GetSaleReturnByIdQuery(Guid id) : IRequest<ApiResponse<SaleReturnDetailDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetSaleReturnByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetSaleReturnByIdQuery, ApiResponse<SaleReturnDetailDto>>
{
    public async Task<ApiResponse<SaleReturnDetailDto>> Handle(GetSaleReturnByIdQuery request, CancellationToken cancellationToken)
    {
        var saleReturn = await unitOfWork.SaleReturns.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (saleReturn == null)
            return ApiResponse<SaleReturnDetailDto>.ErrorResponse("Sale return not found.");

        var result = new SaleReturnDetailDto
        {
            Id = saleReturn.Id,
            ReferenceNo = saleReturn.ReferenceNo,
            SaleId = saleReturn.SaleId,
            SaleReferenceNo = saleReturn.Sale.ReferenceNo,
            CustomerName = saleReturn.Sale?.Customer != null ? saleReturn.Sale.Customer.Name : string.Empty,
            ReturnDate = saleReturn.ReturnDate,
            TotalAmount = saleReturn.TotalAmount,
            Reason = saleReturn.Reason,
            Status = saleReturn.Status,
            Items = saleReturn.SaleReturnItems.Select(sri => new SaleReturnItemDetailDto
            {
                ProductId = sri.ProductId,
                ProductName = sri.Product.Name,
                Quantity = sri.Quantity,
                UnitPrice = sri.UnitPrice,
                SubTotal = sri.SubTotal
            }).ToList()
        };

        return ApiResponse<SaleReturnDetailDto>.SuccessResponse(result);
    }
}
