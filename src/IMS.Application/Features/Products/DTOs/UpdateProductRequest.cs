namespace IMS.Application.Features.Products.DTOs;

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public Guid UnitId { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }
    public decimal StockQuantity { get; set; }
    public decimal AlertQuantity { get; set; }
    public string? ImageUrl { get; set; }
}