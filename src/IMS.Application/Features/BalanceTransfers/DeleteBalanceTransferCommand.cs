using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.BalanceTransfers;

public class DeleteBalanceTransferCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class DeleteBalanceTransferCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteBalanceTransferCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteBalanceTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await unitOfWork.BalanceTransfers.GetByIdAsync(request.Id, cancellationToken);
        if (transfer == null)
            return ApiResponse<bool>.ErrorResponse("Balance transfer not found.");

        await unitOfWork.BalanceTransfers.DeleteAsync(transfer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Balance transfer deleted successfully.");
    }
}
