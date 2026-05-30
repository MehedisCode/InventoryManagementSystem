using IMS.Application.Interfaces;
using IMS.Infrastructure.Persistence;

namespace IMS.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    private ICategoryRepository? _categories;
    private IProductRepository? _products;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public ICategoryRepository Categories
        => _categories ??= new CategoryRepository(_context);

    public IProductRepository Products
        => _products ??= new ProductRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    public void Dispose() => _context.Dispose();
}
