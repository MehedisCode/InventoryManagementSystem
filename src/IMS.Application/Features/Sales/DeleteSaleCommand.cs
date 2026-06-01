using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Sales;

public class DeleteSaleCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public DeleteSaleCommand(Guid id) => Id = id;
}

public class DeleteSaleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteSaleCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteSaleCommand request, CancellationToken cancellationToken)
    {
        var sale = await unitOfWork.Sales.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (sale == null)
            return ApiResponse<bool>.ErrorResponse("Sale not found.");

        // Reverse stock deductions before deleting
        foreach (var item in sale.SaleItems)
        {
            var product = await unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
            if (product != null)
            {
                product.StockQuantity += item.Quantity;
                await unitOfWork.Products.UpdateAsync(product, cancellationToken);
            }
        }

        await unitOfWork.Sales.DeleteAsync(sale, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Sale deleted successfully.");
    }
}
