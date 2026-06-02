using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Repositories;

public class CompanyRepository(ApplicationDbContext context) : GenericRepository<Company>(context), ICompanyRepository
{

    public async Task<Company?> GetCompanyWithCurrencyAsync(CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(c => c.Currency)
            .FirstOrDefaultAsync(cancellationToken);
}
