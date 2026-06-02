using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;

namespace IMS.Infrastructure.Repositories;

public class UnitRepository(ApplicationDbContext context) : GenericRepository<Unit>(context), IUnitRepository;

public class CurrencyRepository(ApplicationDbContext context) : GenericRepository<Currency>(context), ICurrencyRepository;
