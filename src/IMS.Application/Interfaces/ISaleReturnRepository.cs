using IMS.Domain.Entities;

namespace IMS.Application.Interfaces;

public interface ISaleReturnRepository : IGenericRepository<SaleReturn>
{
    Task<IReadOnlyList<SaleReturn>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default);
    Task<SaleReturn?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
