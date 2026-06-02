using IMS.Domain.Entities;

namespace IMS.Application.Interfaces;

public interface IUnitRepository : IGenericRepository<Unit>;

public interface ICurrencyRepository : IGenericRepository<Currency>;

public interface ICompanyRepository : IGenericRepository<Company>
{
    Task<Company?> GetCompanyWithCurrencyAsync(CancellationToken cancellationToken = default);
}
