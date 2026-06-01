namespace IMS.Application.Interfaces;

public interface IUnitOfWork
{
    ICategoryRepository Categories { get; }
    IProductRepository Products { get; }
    ISupplierRepository Suppliers { get; }
    IPurchaseRepository Purchases { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
