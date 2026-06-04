using IMS.Application.Common;
using IMS.Domain.Exceptions;
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

public class CreateProductCommandHandler(IUnitOfWork uow)
        : IRequestHandler<CreateProductCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateProductCommand request, CancellationToken cancellationToken)
    {
        var skuUnique = await uow.Products
            .IsSkuUniqueAsync(request.SKU, cancellationToken: cancellationToken);

        if (!skuUnique)
            throw new BusinessRuleException("A product with this SKU already exists.");

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

        await uow.Products.AddAsync(product, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

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

public class UpdateProductCommandHandler(IUnitOfWork uow)
        : IRequestHandler<UpdateProductCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await uow.Products.GetByIdAsync(request.Id, cancellationToken);
        if (product is null)
            throw new NotFoundException("Product not found.", "ID");

        var skuUnique = await uow.Products
            .IsSkuUniqueAsync(request.SKU, request.Id, cancellationToken);

        if (!skuUnique)
            throw new BusinessRuleException("A product with this SKU already exists.");

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

        await uow.Products.UpdateAsync(product, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Product updated successfully.");
    }
}

public record DeleteProductCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteProductCommandHandler(IUnitOfWork uow)
        : IRequestHandler<DeleteProductCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await uow.Products.GetByIdAsync(request.Id, cancellationToken);
        if (product is null)
            throw new NotFoundException("Product not found.", "ID");

        await uow.Products.DeleteAsync(product, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Product deleted successfully.");
    }
}

