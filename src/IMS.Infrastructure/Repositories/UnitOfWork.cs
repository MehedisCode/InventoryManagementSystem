using IMS.Application.Interfaces;
using IMS.Infrastructure.Persistence;

namespace IMS.Infrastructure.Repositories;

public class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    private ICategoryRepository? _categories;
    private IProductRepository? _products;
    private ISupplierRepository? _suppliers;
    private IPurchaseRepository? _purchases;
    private ICustomerRepository? _customers;
    private ISaleRepository? _sales;
    private ISaleReturnRepository? _saleReturn;

    public ICategoryRepository Categories
        => _categories ??= new CategoryRepository(context);

    public IProductRepository Products
        => _products ??= new ProductRepository(context);

    public ISupplierRepository Suppliers
        => _suppliers ??= new SupplierRepository(context);

    public IPurchaseRepository Purchases
        => _purchases ??= new PurchaseRepository(context);

    public ICustomerRepository Customers
        => _customers ??= new CustomerRepository(context);

    public ISaleRepository Sales
        => _sales ??= new SaleRepository(context);

    public ISaleReturnRepository SaleReturns
        => _saleReturn ??= new SaleReturnRepository(context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
