using IMS.Domain.Common;
using IMS.Domain.Enums;

namespace IMS.Domain.Entities
{
    public class Sale : BaseEntity
    {
        public string ReferenceNo { get; set; } = string.Empty;
        
        public Guid CustomerId { get; set; }
        public Customer Customer { get; set; } = null!;
        
        public DateTime SaleDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DueAmount { get; set; }
        
        public SaleStatus Status { get; set; }
        public string Note { get; set; } = string.Empty;
        
        public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    }
}
