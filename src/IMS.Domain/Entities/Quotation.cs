using IMS.Domain.Common;
using IMS.Domain.Enums;

namespace IMS.Domain.Entities
{
    public class Quotation : BaseEntity
    {
        public string ReferenceNo { get; set; } = string.Empty;
        
        public Guid CustomerId { get; set; }
        public Customer Customer { get; set; } = null!;
        
        public DateTime QuotationDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Discount { get; set; }
        
        public QuotationStatus Status { get; set; }
        public string Note { get; set; } = string.Empty;
        
        public ICollection<QuotationItem> QuotationItems { get; set; } = new List<QuotationItem>();
    }
}
