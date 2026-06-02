using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.BalanceTransfers;

public class GetBalanceTransferByIdQuery(Guid id) : IRequest<ApiResponse<BalanceTransferDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetBalanceTransferByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetBalanceTransferByIdQuery, ApiResponse<BalanceTransferDto>>
{
    public async Task<ApiResponse<BalanceTransferDto>> Handle(GetBalanceTransferByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await unitOfWork.BalanceTransfers.GetByIdAsync(request.Id, cancellationToken);
        if (t == null)
            return ApiResponse<BalanceTransferDto>.ErrorResponse("Balance transfer not found.");

        var result = new BalanceTransferDto
        {
            Id = t.Id,
            ReferenceNo = t.ReferenceNo,
            FromAccount = t.FromAccount,
            ToAccount = t.ToAccount,
            Amount = t.Amount,
            TransferDate = t.TransferDate,
            Note = t.Note,
            Status = t.Status,
            CreatedAt = t.CreatedAt
        };

        return ApiResponse<BalanceTransferDto>.SuccessResponse(result);
    }
}
