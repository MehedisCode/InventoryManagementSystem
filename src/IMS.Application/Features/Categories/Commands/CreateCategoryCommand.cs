using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using MediatR;

namespace IMS.Application.Features.Categories.Commands;

public record CreateCategoryCommand(string Name, string? Description)
    : IRequest<ApiResponse<Guid>>;

public class CreateCategoryCommandHandler(IUnitOfWork uow)
        : IRequestHandler<CreateCategoryCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var isUnique = await uow.Categories
            .IsNameUniqueAsync(request.Name, cancellationToken: cancellationToken);

        if (!isUnique)
            throw new BusinessRuleException("A category with this name already exists.");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description ?? "",
            CreatedAt = DateTime.UtcNow
        };

        await uow.Categories.AddAsync(category, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(category.Id, "Category created successfully.");
    }
}

