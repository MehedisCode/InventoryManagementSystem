using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Repositories;

public class SaleReturnRepository(ApplicationDbContext context) : GenericRepository<SaleReturn>(context), ISaleReturnRepository
{
    public async Task<IReadOnlyList<SaleReturn>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(sr => sr.Sale)
                .ThenInclude(s => s.Customer)
            .ToListAsync(cancellationToken);

    public async Task<SaleReturn?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(sr => sr.Sale)
                .ThenInclude(s => s.Customer)
            .Include(sr => sr.Sale)
                .ThenInclude(s => s.SaleItems)
            .Include(sr => sr.SaleReturnItems)
                .ThenInclude(sri => sri.Product)
            .FirstOrDefaultAsync(sr => sr.Id == id, cancellationToken);
}
