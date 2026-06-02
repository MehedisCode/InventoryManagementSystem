using IMS.Domain.Enums;

namespace IMS.Application.Features.Quotations;

public class QuotationItemInputDto
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class QuotationItemDetailDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
}

public class QuotationListDto
{
    public Guid Id { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateTime QuotationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal TotalAmount { get; set; }
    public QuotationStatus Status { get; set; }
}

public class QuotationDetailDto
{
    public Guid Id { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime QuotationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal Discount { get; set; }
    public QuotationStatus Status { get; set; }
    public string Note { get; set; } = string.Empty;
    public List<QuotationItemDetailDto> Items { get; set; } = new();
}
