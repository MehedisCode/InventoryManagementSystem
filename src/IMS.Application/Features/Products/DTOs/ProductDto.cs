namespace IMS.Application.Features.Products.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string UnitName { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }
    public decimal StockQuantity { get; set; }
    public decimal AlertQuantity { get; set; }
    public string? ImageUrl { get; set; }
}