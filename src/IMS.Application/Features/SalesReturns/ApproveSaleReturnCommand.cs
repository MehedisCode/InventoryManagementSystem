using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.SalesReturns;

public class ApproveSaleReturnCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class ApproveSaleReturnCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<ApproveSaleReturnCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ApproveSaleReturnCommand request, CancellationToken cancellationToken)
    {
        var saleReturn = await unitOfWork.SaleReturns.GetByIdAsync(request.Id, cancellationToken);
        if (saleReturn == null)
            return ApiResponse<bool>.ErrorResponse("Sale return not found.");

        if (saleReturn.Status != ReturnStatus.Pending)
            return ApiResponse<bool>.ErrorResponse("Only pending returns can be approved.");

        saleReturn.Status = ReturnStatus.Approved;

        await unitOfWork.SaleReturns.UpdateAsync(saleReturn, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Sale return approved successfully.");
    }
}

public class RejectSaleReturnCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class RejectSaleReturnCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<RejectSaleReturnCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(RejectSaleReturnCommand request, CancellationToken cancellationToken)
    {
        var saleReturn = await unitOfWork.SaleReturns.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (saleReturn == null)
            return ApiResponse<bool>.ErrorResponse("Sale return not found.");

        if (saleReturn.Status == ReturnStatus.Rejected)
            return ApiResponse<bool>.ErrorResponse("Sale return is already rejected.");

        // If it was Pending (stock already increased on create), reverse the stock
        if (saleReturn.Status == ReturnStatus.Pending)
        {
            foreach (var item in saleReturn.SaleReturnItems)
            {
                var product = await unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
                if (product != null)
                {
                    product.StockQuantity -= item.Quantity;
                    await unitOfWork.Products.UpdateAsync(product, cancellationToken);
                }
            }
        }

        saleReturn.Status = ReturnStatus.Rejected;

        await unitOfWork.SaleReturns.UpdateAsync(saleReturn, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Sale return rejected successfully.");
    }
}
