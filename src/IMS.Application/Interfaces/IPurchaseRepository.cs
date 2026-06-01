using IMS.Domain.Entities;

namespace IMS.Application.Interfaces;

public interface IPurchaseRepository : IGenericRepository<Purchase>
{
    Task<IReadOnlyList<Purchase>> GetAllWithSuppliersAsync(CancellationToken cancellationToken = default);
    Task<Purchase?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
