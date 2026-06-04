using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.BalanceTransfers;

public class CancelTransferCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class CancelTransferCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CancelTransferCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(CancelTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await unitOfWork.BalanceTransfers.GetByIdAsync(request.Id, cancellationToken);
        if (transfer == null)
            throw new NotFoundException("Balance transfer not found.", "ID");

        transfer.Status = TransferStatus.Cancelled;

        await unitOfWork.BalanceTransfers.UpdateAsync(transfer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Balance transfer cancelled successfully.");
    }
}