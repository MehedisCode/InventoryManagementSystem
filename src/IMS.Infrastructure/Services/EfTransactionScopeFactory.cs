using IMS.Application.Interfaces;
using IMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Storage;

namespace IMS.Infrastructure.Services;

public class EfTransactionScopeFactory(ApplicationDbContext dbContext) : ITransactionScopeFactory
{
    public async Task<ITransactionScope> BeginAsync(CancellationToken cancellationToken = default)
        => new EfTransactionScope(await dbContext.Database.BeginTransactionAsync(cancellationToken));
}

internal class EfTransactionScope(IDbContextTransaction tx) : ITransactionScope
{
    public async Task CommitAsync(CancellationToken cancellationToken = default)
        => await tx.CommitAsync(cancellationToken);

    public async ValueTask DisposeAsync()
        => await tx.DisposeAsync();
}
