using MediatR;
using IMS.Domain.Exceptions;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Application.Features.Categories.DTOs;

namespace IMS.Application.Features.Categories.Queries;

public record GetAllCategoriesQuery : IRequest<ApiResponse<IReadOnlyList<CategoryDto>>>;

public class GetAllCategoriesQueryHandler(IUnitOfWork uow)
        : IRequestHandler<GetAllCategoriesQuery, ApiResponse<IReadOnlyList<CategoryDto>>>
{
    public async Task<ApiResponse<IReadOnlyList<CategoryDto>>> Handle(
        GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await uow.Categories.GetAllAsync(cancellationToken);

        var dtos = categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            CreatedAt = c.CreatedAt
        }).ToList();

        return ApiResponse<IReadOnlyList<CategoryDto>>.SuccessResponse(dtos);
    }
}

public record GetCategoryByIdQuery(Guid Id) : IRequest<ApiResponse<CategoryDto>>;

public class GetCategoryByIdQueryHandler(IUnitOfWork uow)
        : IRequestHandler<GetCategoryByIdQuery, ApiResponse<CategoryDto>>
{
    public async Task<ApiResponse<CategoryDto>> Handle(
        GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await uow.Categories.GetByIdAsync(request.Id, cancellationToken);

        if (category is null)
            throw new NotFoundException("Category not found.", "ID");

        var dto = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            CreatedAt = category.CreatedAt
        };

        return ApiResponse<CategoryDto>.SuccessResponse(dto);
    }
}

