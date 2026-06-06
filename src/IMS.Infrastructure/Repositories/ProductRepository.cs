using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Repositories;

public class ProductRepository(ApplicationDbContext context) : GenericRepository<Product>(context), IProductRepository
{
    public async Task<Product?> GetByIdWithDetailsAsync(Guid id,
        CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Unit)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Product>> GetAllWithDetailsAsync(
        CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Unit)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Product>> GetLowStockProductsAsync(
        CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Unit)
            .Where(p => p.StockQuantity <= p.AlertQuantity)
            .ToListAsync(cancellationToken);

    public async Task<bool> IsSkuUniqueAsync(string sku, Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(p => p.SKU.ToLower() == sku.ToLower());

        if (excludeId.HasValue)
            query = query.Where(p => p.Id != excludeId.Value);

        return !await query.AnyAsync(cancellationToken);
    }
}
