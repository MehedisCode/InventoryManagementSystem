using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;

namespace IMS.Infrastructure.Repositories;

public class SupplierRepository(ApplicationDbContext context) : GenericRepository<Supplier>(context), ISupplierRepository;
