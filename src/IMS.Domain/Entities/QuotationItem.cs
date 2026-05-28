using IMS.Domain.Common;

namespace IMS.Domain.Entities
{
    public class QuotationItem : BaseEntity
    {
        public Guid QuotationId { get; set; }
        public Quotation Quotation { get; set; } = null!;
        
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
        
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal SubTotal { get; set; }
    }
}
