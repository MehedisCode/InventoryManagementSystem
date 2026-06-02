namespace IMS.Application.Interfaces;

public interface IUnitOfWork
{
    ICategoryRepository Categories { get; }
    IProductRepository Products { get; }
    ISupplierRepository Suppliers { get; }
    IPurchaseRepository Purchases { get; }
    ICustomerRepository Customers { get; }
    ISaleRepository Sales { get; }
    ISaleReturnRepository SaleReturns { get; }
    IBalanceTransferRepository BalanceTransfers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
