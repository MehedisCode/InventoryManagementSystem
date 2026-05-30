using IMS.Domain.Entities;

namespace IMS.Application.Interfaces;

public interface IProductRepository : IGenericRepository<Product>
{
    Task<Product?> GetByIdWithDetailsAsync(Guid id,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetAllWithDetailsAsync(
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetLowStockProductsAsync(
        CancellationToken cancellationToken = default);
    Task<bool> IsSkuUniqueAsync(string sku, Guid? excludeId = null,
        CancellationToken cancellationToken = default);
}
