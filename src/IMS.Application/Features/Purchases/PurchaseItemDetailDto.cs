using System;

namespace IMS.Application.Features.Purchases
{
    public class PurchaseItemDetailDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public decimal SubTotal { get; set; }
    }
}
