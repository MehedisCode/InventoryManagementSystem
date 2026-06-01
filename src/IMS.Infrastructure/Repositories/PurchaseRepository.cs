using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Repositories;

public class PurchaseRepository : GenericRepository<Purchase>, IPurchaseRepository
{
    public PurchaseRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Purchase>> GetAllWithSuppliersAsync(CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(p => p.Supplier)
            .ToListAsync(cancellationToken);

    public async Task<Purchase?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(p => p.Supplier)
            .Include(p => p.PurchaseItems)
                .ThenInclude(pi => pi.Product)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
}
