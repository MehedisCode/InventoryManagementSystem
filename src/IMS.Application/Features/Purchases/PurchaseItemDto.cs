using System;

namespace IMS.Application.Features.Purchases
{
    public class PurchaseItemDto
    {
        public Guid ProductId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitCost { get; set; }
    }
}
