using IMS.Domain.Entities;

namespace IMS.Application.Interfaces;

public interface ICategoryRepository : IGenericRepository<Category>
{
    Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null,
        CancellationToken cancellationToken = default);
}
