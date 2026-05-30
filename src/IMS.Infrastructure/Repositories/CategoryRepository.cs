using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Repositories;

public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context) { }

    public async Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(c => c.Name.ToLower() == name.ToLower());

        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        return !await query.AnyAsync(cancellationToken);
    }
}
