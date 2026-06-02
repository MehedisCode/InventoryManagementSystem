using IMS.Domain.Enums;

namespace IMS.Application.Features.BalanceTransfers;

public class BalanceTransferDto
{
    public Guid Id { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string FromAccount { get; set; } = string.Empty;
    public string ToAccount { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime TransferDate { get; set; }
    public string Note { get; set; } = string.Empty;
    public TransferStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
