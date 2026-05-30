using IMS.Domain.Common;

namespace IMS.Domain.Entities
{
    public class Product : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public Guid UnitId { get; set; }
        public Unit Unit { get; set; } = null!;

        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public decimal StockQuantity { get; set; }
        public decimal AlertQuantity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
