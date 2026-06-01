using System;
using IMS.Domain.Enums;

namespace IMS.Application.Features.Purchases
{
    public class PurchaseListDto
    {
        public Guid Id { get; set; }
        public string ReferenceNo { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DueAmount { get; set; }
        public PurchaseStatus Status { get; set; }
    }
}
