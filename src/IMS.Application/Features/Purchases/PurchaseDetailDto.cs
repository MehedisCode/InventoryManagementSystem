using System;
using System.Collections.Generic;
using IMS.Domain.Enums;

namespace IMS.Application.Features.Purchases
{
    public class PurchaseDetailDto
    {
        public Guid Id { get; set; }
        public string ReferenceNo { get; set; } = string.Empty;
        public Guid SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DueAmount { get; set; }
        public string Note { get; set; } = string.Empty;
        public PurchaseStatus Status { get; set; }

        public List<PurchaseItemDetailDto> Items { get; set; } = new List<PurchaseItemDetailDto>();
    }
}
