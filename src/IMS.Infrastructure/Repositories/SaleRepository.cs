using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Repositories;

public class SaleRepository : GenericRepository<Sale>, ISaleRepository
{
    public SaleRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Sale>> GetAllWithCustomersAsync(CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(s => s.Customer)
            .ToListAsync(cancellationToken);

    public async Task<Sale?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.SaleItems)
                .ThenInclude(si => si.Product)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
}
