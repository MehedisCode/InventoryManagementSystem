using IMS.Application.Interfaces;
using IMS.Infrastructure.Persistence;

namespace IMS.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    private ICategoryRepository? _categories;
    private IProductRepository? _products;
    private ISupplierRepository? _suppliers;
    private IPurchaseRepository? _purchases;
    private ICustomerRepository? _customers;
    private ISaleRepository? _sales;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public ICategoryRepository Categories
        => _categories ??= new CategoryRepository(_context);

    public IProductRepository Products
        => _products ??= new ProductRepository(_context);

    public ISupplierRepository Suppliers
        => _suppliers ??= new SupplierRepository(_context);

    public IPurchaseRepository Purchases
        => _purchases ??= new PurchaseRepository(_context);

    public ICustomerRepository Customers
        => _customers ??= new CustomerRepository(_context);

    public ISaleRepository Sales
        => _sales ??= new SaleRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);
}
