using IMS.Domain.Entities;

namespace IMS.Application.Interfaces;

public interface ISaleRepository : IGenericRepository<Sale>
{
    Task<IReadOnlyList<Sale>> GetAllWithCustomersAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Sale>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default);
    Task<Sale?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
