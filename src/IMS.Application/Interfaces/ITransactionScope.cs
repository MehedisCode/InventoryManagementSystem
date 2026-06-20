namespace IMS.Application.Interfaces;

public interface ITransactionScope : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken = default);
}

public interface ITransactionScopeFactory
{
    Task<ITransactionScope> BeginAsync(CancellationToken cancellationToken = default);
}
