using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.SalesReturns;

public class DeleteSaleReturnCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class DeleteSaleReturnCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteSaleReturnCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteSaleReturnCommand request, CancellationToken cancellationToken)
    {
        var saleReturn = await unitOfWork.SaleReturns.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (saleReturn == null)
            throw new NotFoundException("Sale return not found.", "ID");

        // Reverse stock increases before deleting
        foreach (var item in saleReturn.SaleReturnItems)
        {
            var product = await unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
            if (product != null)
            {
                product.StockQuantity -= item.Quantity;
                await unitOfWork.Products.UpdateAsync(product, cancellationToken);
            }
        }

        await unitOfWork.SaleReturns.DeleteAsync(saleReturn, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Sale return deleted successfully.");
    }
}

