using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.BalanceTransfers;

public class CompleteTransferCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class CompleteTransferCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CompleteTransferCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(CompleteTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await unitOfWork.BalanceTransfers.GetByIdAsync(request.Id, cancellationToken);
        if (transfer == null)
            return ApiResponse<bool>.ErrorResponse("Balance transfer not found.");

        transfer.Status = TransferStatus.Completed;

        await unitOfWork.BalanceTransfers.UpdateAsync(transfer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Balance transfer completed successfully.");
    }
}
