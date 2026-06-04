using FluentValidation;
using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.BalanceTransfers;

public class UpdateBalanceTransferCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public string FromAccount { get; set; } = string.Empty;
    public string ToAccount { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime TransferDate { get; set; }
    public string Note { get; set; } = string.Empty;
    public TransferStatus Status { get; set; }
}

public class UpdateBalanceTransferCommandValidator : AbstractValidator<UpdateBalanceTransferCommand>
{
    public UpdateBalanceTransferCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FromAccount).NotEmpty().MaximumLength(150);
        RuleFor(x => x.ToAccount).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.TransferDate).NotEmpty();
        RuleFor(x => x.FromAccount).NotEqual(x => x.ToAccount)
            .WithMessage("FromAccount must not equal ToAccount");
    }
}

public class UpdateBalanceTransferCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateBalanceTransferCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateBalanceTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await unitOfWork.BalanceTransfers.GetByIdAsync(request.Id, cancellationToken);
        if (transfer == null)
            throw new NotFoundException("Balance transfer not found.", "ID");

        transfer.FromAccount = request.FromAccount;
        transfer.ToAccount = request.ToAccount;
        transfer.Amount = request.Amount;
        transfer.TransferDate = request.TransferDate;
        transfer.Note = request.Note;
        transfer.Status = request.Status;

        await unitOfWork.BalanceTransfers.UpdateAsync(transfer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Balance transfer updated successfully.");
    }
}

