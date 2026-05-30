using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using MediatR;

namespace IMS.Application.Features.Categories.Commands;

public record CreateCategoryCommand(string Name, string? Description)
    : IRequest<ApiResponse<Guid>>;

public class CreateCategoryCommandHandler
    : IRequestHandler<CreateCategoryCommand, ApiResponse<Guid>>
{
    private readonly IUnitOfWork _uow;

    public CreateCategoryCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<Guid>> Handle(
        CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var isUnique = await _uow.Categories
            .IsNameUniqueAsync(request.Name, cancellationToken: cancellationToken);

        if (!isUnique)
            return ApiResponse<Guid>.ErrorResponse("A category with this name already exists.");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description ?? "",
            CreatedAt = DateTime.UtcNow
        };

        await _uow.Categories.AddAsync(category, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(category.Id, "Category created successfully.");
    }
}
