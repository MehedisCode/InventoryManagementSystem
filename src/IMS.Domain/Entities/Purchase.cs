using IMS.Domain.Common;
using IMS.Domain.Enums;

namespace IMS.Domain.Entities
{
    public class Purchase : BaseEntity
    {
        public string ReferenceNo { get; set; } = string.Empty;
        
        public Guid SupplierId { get; set; }
        public Supplier Supplier { get; set; } = null!;
        
        public DateTime PurchaseDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DueAmount { get; set; }
        
        public PurchaseStatus Status { get; set; }
        public string Note { get; set; } = string.Empty;
        
        public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
    }
}
