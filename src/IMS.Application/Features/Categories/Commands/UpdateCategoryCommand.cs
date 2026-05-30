using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Categories.Commands;

public record UpdateCategoryCommand(Guid Id, string Name, string? Description)
    : IRequest<ApiResponse<bool>>;

public class UpdateCategoryCommandHandler
    : IRequestHandler<UpdateCategoryCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public UpdateCategoryCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<bool>> Handle(
        UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _uow.Categories.GetByIdAsync(request.Id, cancellationToken);
        if (category is null)
            return ApiResponse<bool>.ErrorResponse("Category not found.");

        var isUnique = await _uow.Categories
            .IsNameUniqueAsync(request.Name, request.Id, cancellationToken);

        if (!isUnique)
            return ApiResponse<bool>.ErrorResponse("A category with this name already exists.");

        category.Name = request.Name;
        category.Description = request.Description ?? "";
        category.UpdatedAt = DateTime.UtcNow;

        await _uow.Categories.UpdateAsync(category, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Category updated successfully.");
    }
}
