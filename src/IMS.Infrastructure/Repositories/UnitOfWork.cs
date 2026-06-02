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
    private ISaleReturnRepository? _saleReturns;
    private IBalanceTransferRepository? _balanceTransfers;
    private IQuotationRepository? _quotations;

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
        => _saleReturns ??= new SaleReturnRepository(context);

    public IBalanceTransferRepository BalanceTransfers
        => _balanceTransfers ??= new BalanceTransferRepository(context);

    public IQuotationRepository Quotations
        => _quotations ??= new QuotationRepository(context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
