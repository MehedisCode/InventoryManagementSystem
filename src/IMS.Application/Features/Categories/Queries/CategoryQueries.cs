using IMS.Application.Common;
using IMS.Application.Features.Categories.DTOs;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Categories.Queries;

public record GetAllCategoriesQuery : IRequest<ApiResponse<IReadOnlyList<CategoryDto>>>;

public class GetAllCategoriesQueryHandler
    : IRequestHandler<GetAllCategoriesQuery, ApiResponse<IReadOnlyList<CategoryDto>>>
{
    private readonly IUnitOfWork _uow;

    public GetAllCategoriesQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<ApiResponse<IReadOnlyList<CategoryDto>>> Handle(
        GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _uow.Categories.GetAllAsync(cancellationToken);

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

public class GetCategoryByIdQueryHandler
    : IRequestHandler<GetCategoryByIdQuery, ApiResponse<CategoryDto>>
{
    private readonly IUnitOfWork _uow;

    public GetCategoryByIdQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<ApiResponse<CategoryDto>> Handle(
        GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _uow.Categories.GetByIdAsync(request.Id, cancellationToken);

        if (category is null)
            return ApiResponse<CategoryDto>.ErrorResponse("Category not found.");

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
