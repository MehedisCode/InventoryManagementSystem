using IMS.Domain.Enums;

namespace IMS.Application.Features.Sales;

public class SaleItemInputDto
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class SaleListDto
{
    public Guid Id { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount { get; set; }
    public SaleStatus Status { get; set; }
}

public class SaleItemDetailDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
}

public class SaleDetailDto
{
    public Guid Id { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount { get; set; }
    public string Note { get; set; } = string.Empty;
    public SaleStatus Status { get; set; }
    public List<SaleItemDetailDto> Items { get; set; } = new();
}
