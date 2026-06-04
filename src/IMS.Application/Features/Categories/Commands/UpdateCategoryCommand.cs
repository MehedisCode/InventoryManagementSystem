using MediatR;
using IMS.Domain.Exceptions;
using IMS.Application.Common;
using IMS.Application.Interfaces;

namespace IMS.Application.Features.Categories.Commands;

public record UpdateCategoryCommand(Guid Id, string Name, string? Description)
    : IRequest<ApiResponse<bool>>;

public class UpdateCategoryCommandHandler(IUnitOfWork uow)
        : IRequestHandler<UpdateCategoryCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await uow.Categories.GetByIdAsync(request.Id, cancellationToken);
        if (category is null)
            throw new NotFoundException("Category not found.", "ID");

        var isUnique = await uow.Categories
            .IsNameUniqueAsync(request.Name, request.Id, cancellationToken);

        if (!isUnique)
            throw new BusinessRuleException("A category with this name already exists.");

        category.Name = request.Name;
        category.Description = request.Description ?? "";
        category.UpdatedAt = DateTime.UtcNow;

        await uow.Categories.UpdateAsync(category, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Category updated successfully.");
    }
}

