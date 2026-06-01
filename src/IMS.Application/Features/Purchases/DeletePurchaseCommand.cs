using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Purchases;

public class DeletePurchaseCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class DeletePurchaseCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeletePurchaseCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeletePurchaseCommand request, CancellationToken cancellationToken)
    {
        var purchase = await unitOfWork.Purchases.GetByIdWithDetailsAsync(request.Id, cancellationToken);

        if (purchase == null) return ApiResponse<bool>.ErrorResponse("Purchase not found.");

        foreach (var item in purchase.PurchaseItems)
        {
            var product = await unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
            if (product != null)
            {
                product.StockQuantity -= item.Quantity;
                await unitOfWork.Products.UpdateAsync(product, cancellationToken);
            }
        }

        await unitOfWork.Purchases.DeleteAsync(purchase, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Purchase deleted successfully.");
    }
}
