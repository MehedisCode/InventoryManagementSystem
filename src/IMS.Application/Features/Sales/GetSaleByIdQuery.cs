using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Sales;

public class GetSaleByIdQuery(Guid id) : IRequest<ApiResponse<SaleDetailDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetSaleByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetSaleByIdQuery, ApiResponse<SaleDetailDto>>
{
    public async Task<ApiResponse<SaleDetailDto>> Handle(GetSaleByIdQuery request, CancellationToken cancellationToken)
    {
        var sale = await unitOfWork.Sales.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (sale == null)
            throw new NotFoundException("Sale not found.", "ID");

        var result = new SaleDetailDto
        {
            Id = sale.Id,
            ReferenceNo = sale.ReferenceNo,
            CustomerId = sale.CustomerId,
            CustomerName = sale.Customer.Name,
            SaleDate = sale.SaleDate,
            TotalAmount = sale.TotalAmount,
            Discount = sale.Discount,
            PaidAmount = sale.PaidAmount,
            DueAmount = sale.DueAmount,
            Note = sale.Note,
            Status = sale.Status,
            Items = sale.SaleItems.Select(si => new SaleItemDetailDto
            {
                ProductId = si.ProductId,
                ProductName = si.Product.Name,
                Quantity = si.Quantity,
                UnitPrice = si.UnitPrice,
                SubTotal = si.SubTotal
            }).ToList()
        };

        return ApiResponse<SaleDetailDto>.SuccessResponse(result);
    }
}

