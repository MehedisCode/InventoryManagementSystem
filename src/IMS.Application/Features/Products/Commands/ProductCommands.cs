using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using MediatR;

namespace IMS.Application.Features.Products.Commands;

public record CreateProductCommand(
    string Name,
    string SKU,
    string? Description,
    Guid CategoryId,
    Guid UnitId,
    decimal CostPrice,
    decimal SalePrice,
    decimal StockQuantity,
    decimal AlertQuantity,
    string? ImageUrl) : IRequest<ApiResponse<Guid>>;

public class CreateProductCommandHandler
    : IRequestHandler<CreateProductCommand, ApiResponse<Guid>>
{
    private readonly IUnitOfWork _uow;

    public CreateProductCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<Guid>> Handle(
        CreateProductCommand request, CancellationToken cancellationToken)
    {
        var skuUnique = await _uow.Products
            .IsSkuUniqueAsync(request.SKU, cancellationToken: cancellationToken);

        if (!skuUnique)
            return ApiResponse<Guid>.ErrorResponse("A product with this SKU already exists.");

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            SKU = request.SKU,
            Description = request.Description ?? "",
            CategoryId = request.CategoryId,
            UnitId = request.UnitId,
            CostPrice = request.CostPrice,
            SalePrice = request.SalePrice,
            StockQuantity = request.StockQuantity,
            AlertQuantity = request.AlertQuantity,
            ImageUrl = request.ImageUrl ?? "",
            CreatedAt = DateTime.UtcNow
        };

        await _uow.Products.AddAsync(product, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(product.Id, "Product created successfully.");
    }
}

public record UpdateProductCommand(
    string Name,
    string SKU,
    string? Description,
    Guid CategoryId,
    Guid UnitId,
    decimal CostPrice,
    decimal SalePrice,
    decimal StockQuantity,
    decimal AlertQuantity,
    string? ImageUrl,
    Guid Id) : IRequest<ApiResponse<bool>>;

public class UpdateProductCommandHandler
    : IRequestHandler<UpdateProductCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public UpdateProductCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<bool>> Handle(
        UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _uow.Products.GetByIdAsync(request.Id, cancellationToken);
        if (product is null)
            return ApiResponse<bool>.ErrorResponse("Product not found.");

        var skuUnique = await _uow.Products
            .IsSkuUniqueAsync(request.SKU, request.Id, cancellationToken);

        if (!skuUnique)
            return ApiResponse<bool>.ErrorResponse("A product with this SKU already exists.");

        product.Name = request.Name;
        product.SKU = request.SKU;
        product.Description = request.Description ?? "";
        product.CategoryId = request.CategoryId;
        product.UnitId = request.UnitId;
        product.CostPrice = request.CostPrice;
        product.SalePrice = request.SalePrice;
        product.StockQuantity = request.StockQuantity;
        product.AlertQuantity = request.AlertQuantity;
        product.ImageUrl = request.ImageUrl ?? "";
        product.UpdatedAt = DateTime.UtcNow;

        await _uow.Products.UpdateAsync(product, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Product updated successfully.");
    }
}

public record DeleteProductCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteProductCommandHandler
    : IRequestHandler<DeleteProductCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public DeleteProductCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<bool>> Handle(
        DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _uow.Products.GetByIdAsync(request.Id, cancellationToken);
        if (product is null)
            return ApiResponse<bool>.ErrorResponse("Product not found.");

        await _uow.Products.DeleteAsync(product, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Product deleted successfully.");
    }
}
