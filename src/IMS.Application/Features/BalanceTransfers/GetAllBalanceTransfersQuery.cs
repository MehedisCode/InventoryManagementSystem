using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.BalanceTransfers;

public class GetAllBalanceTransfersQuery : IRequest<ApiResponse<List<BalanceTransferDto>>>
{
    public TransferStatus? Status { get; set; }
}

public class GetAllBalanceTransfersQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllBalanceTransfersQuery, ApiResponse<List<BalanceTransferDto>>>
{
    public async Task<ApiResponse<List<BalanceTransferDto>>> Handle(GetAllBalanceTransfersQuery request, CancellationToken cancellationToken)
    {
        var transfers = await unitOfWork.BalanceTransfers.GetAllAsync(cancellationToken);

        if (request.Status.HasValue)
        {
            transfers = transfers.Where(t => t.Status == request.Status.Value).ToList();
        }

        var result = transfers
            .OrderByDescending(t => t.TransferDate)
            .Select(t => new BalanceTransferDto
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
            }).ToList();

        return ApiResponse<List<BalanceTransferDto>>.SuccessResponse(result);
    }
}
