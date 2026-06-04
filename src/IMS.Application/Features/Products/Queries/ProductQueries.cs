using MediatR;
using IMS.Domain.Exceptions;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Application.Features.Products.DTOs;

namespace IMS.Application.Features.Products.Queries;

public record GetAllProductsQuery : IRequest<ApiResponse<IReadOnlyList<ProductDto>>>;

public class GetAllProductsQueryHandler(IUnitOfWork uow)
        : IRequestHandler<GetAllProductsQuery, ApiResponse<IReadOnlyList<ProductDto>>>
{
    public async Task<ApiResponse<IReadOnlyList<ProductDto>>> Handle(
        GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await uow.Products.GetAllWithDetailsAsync(cancellationToken);

        var dto = products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            SKU = p.SKU,
            Description = p.Description,
            CategoryName = p.Category.Name,
            UnitName = p.Unit.Name,
            CostPrice = p.CostPrice,
            SalePrice = p.SalePrice,
            StockQuantity = p.StockQuantity,
            AlertQuantity = p.AlertQuantity,
            ImageUrl = p.ImageUrl
        }).ToList();

        return ApiResponse<IReadOnlyList<ProductDto>>.SuccessResponse(dto);
    }
}

public record GetProductByIdQuery(Guid Id) : IRequest<ApiResponse<ProductDto>>;

public class GetProductByIdQueryHandler(IUnitOfWork uow)
        : IRequestHandler<GetProductByIdQuery, ApiResponse<ProductDto>>
{
    public async Task<ApiResponse<ProductDto>> Handle(
        GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await uow.Products
            .GetByIdWithDetailsAsync(request.Id, cancellationToken);

        if (product is null)
            throw new NotFoundException("Product not found.", "ID");

        var dto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            SKU = product.SKU,
            Description = product.Description,
            CategoryName = product.Category.Name,
            UnitName = product.Unit.Name,
            CostPrice = product.CostPrice,
            SalePrice = product.SalePrice,
            StockQuantity = product.StockQuantity,
            AlertQuantity = product.AlertQuantity,
            ImageUrl = product.ImageUrl
        };

        return ApiResponse<ProductDto>.SuccessResponse(dto);
    }
}

public record GetLowStockProductsQuery : IRequest<ApiResponse<IReadOnlyList<ProductDto>>>;

public class GetLowStockProductsQueryHandler(IUnitOfWork uow)
        : IRequestHandler<GetLowStockProductsQuery, ApiResponse<IReadOnlyList<ProductDto>>>
{
    public async Task<ApiResponse<IReadOnlyList<ProductDto>>> Handle(
        GetLowStockProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await uow.Products.GetLowStockProductsAsync(cancellationToken);

        var dto = products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            SKU = p.SKU,
            Description = p.Description,
            CategoryName = p.Category.Name,
            UnitName = p.Unit.Name,
            CostPrice = p.CostPrice,
            SalePrice = p.SalePrice,
            StockQuantity = p.StockQuantity,
            AlertQuantity = p.AlertQuantity,
            ImageUrl = p.ImageUrl
        }).ToList();

        return ApiResponse<IReadOnlyList<ProductDto>>.SuccessResponse(dto);
    }
}

