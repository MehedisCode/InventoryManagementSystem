using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Repositories;

public class QuotationRepository(ApplicationDbContext context) : GenericRepository<Quotation>(context), IQuotationRepository
{

    public async Task<IReadOnlyList<Quotation>> GetAllWithCustomersAsync(CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(q => q.Customer)
            .ToListAsync(cancellationToken);

    public async Task<Quotation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(q => q.Customer)
            .Include(q => q.QuotationItems)
                .ThenInclude(qi => qi.Product)
            .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
}
