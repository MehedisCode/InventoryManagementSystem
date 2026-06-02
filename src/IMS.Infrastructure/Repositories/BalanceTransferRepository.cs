using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;

namespace IMS.Infrastructure.Repositories;

public class BalanceTransferRepository(ApplicationDbContext context)
    : GenericRepository<BalanceTransfer>(context), IBalanceTransferRepository;
