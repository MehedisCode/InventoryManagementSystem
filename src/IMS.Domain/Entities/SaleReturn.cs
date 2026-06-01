using IMS.Domain.Common;
using IMS.Domain.Enums;

namespace IMS.Domain.Entities;

public class SaleReturn : BaseEntity
{
    public string ReferenceNo { get; set; } = string.Empty;

    public Guid SaleId { get; set; }
    public Sale Sale { get; set; } = null!;

    public DateTime ReturnDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Reason { get; set; } = string.Empty;

    public ReturnStatus Status { get; set; }

    public ICollection<SaleReturnItem> SaleReturnItems { get; set; } = [];
}