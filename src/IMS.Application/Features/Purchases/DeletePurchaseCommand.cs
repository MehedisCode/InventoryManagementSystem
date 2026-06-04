using MediatR;
using IMS.Domain.Exceptions;
using IMS.Application.Common;
using IMS.Application.Interfaces;

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

        if (purchase == null) throw new NotFoundException("Purchase not found.", "ID");

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

