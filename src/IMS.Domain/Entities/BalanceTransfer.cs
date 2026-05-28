using IMS.Domain.Common;
using IMS.Domain.Enums;

namespace IMS.Domain.Entities
{
    public class BalanceTransfer : BaseEntity
    {
        public string ReferenceNo { get; set; } = string.Empty;
        public string FromAccount { get; set; } = string.Empty;
        public string ToAccount { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime TransferDate { get; set; }
        public string Note { get; set; } = string.Empty;
        public TransferStatus Status { get; set; }
    }
}
