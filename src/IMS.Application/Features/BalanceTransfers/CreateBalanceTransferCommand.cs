using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.BalanceTransfers;

public class CreateBalanceTransferCommand : IRequest<ApiResponse<Guid>>
{
    public string FromAccount { get; set; } = string.Empty;
    public string ToAccount { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime TransferDate { get; set; }
    public string Note { get; set; } = string.Empty;
    public TransferStatus Status { get; set; }
}

public class CreateBalanceTransferCommandValidator : AbstractValidator<CreateBalanceTransferCommand>
{
    public CreateBalanceTransferCommandValidator()
    {
        RuleFor(x => x.FromAccount).NotEmpty().MaximumLength(150);
        RuleFor(x => x.ToAccount).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.TransferDate).NotEmpty();
        RuleFor(x => x.FromAccount).NotEqual(x => x.ToAccount)
            .WithMessage("FromAccount must not equal ToAccount");
    }
}

public class CreateBalanceTransferCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateBalanceTransferCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateBalanceTransferCommand request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var count = await unitOfWork.BalanceTransfers.CountAsync(t => t.CreatedAt.Date == today.Date, cancellationToken);
        var referenceNo = $"TRF-{today:yyyyMMdd}-{(count + 1):D4}";

        var transfer = new BalanceTransfer
        {
            ReferenceNo = referenceNo,
            FromAccount = request.FromAccount,
            ToAccount = request.ToAccount,
            Amount = request.Amount,
            TransferDate = request.TransferDate,
            Note = request.Note,
            Status = request.Status
        };

        await unitOfWork.BalanceTransfers.AddAsync(transfer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(transfer.Id, "Balance transfer created successfully.");
    }
}

