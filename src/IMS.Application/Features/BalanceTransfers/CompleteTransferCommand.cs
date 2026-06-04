using MediatR;
using IMS.Domain.Enums;
using IMS.Domain.Exceptions;
using IMS.Application.Common;
using IMS.Application.Interfaces;

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
            throw new NotFoundException("Balance transfer not found.", "ID");

        transfer.Status = TransferStatus.Completed;

        await unitOfWork.BalanceTransfers.UpdateAsync(transfer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Balance transfer completed successfully.");
    }
}

