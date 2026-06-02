using IMS.Domain.Entities;

namespace IMS.Application.Interfaces;

public interface IQuotationRepository : IGenericRepository<Quotation>
{
    Task<IReadOnlyList<Quotation>> GetAllWithCustomersAsync(CancellationToken cancellationToken = default);
    Task<Quotation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
