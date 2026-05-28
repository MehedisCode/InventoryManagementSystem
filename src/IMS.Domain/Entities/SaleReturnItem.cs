using IMS.Domain.Common;

namespace IMS.Domain.Entities
{
    public class SaleReturnItem : BaseEntity
    {
        public Guid SaleReturnId { get; set; }
        public SaleReturn SaleReturn { get; set; } = null!;
        
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
        
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal SubTotal { get; set; }
    }
}
