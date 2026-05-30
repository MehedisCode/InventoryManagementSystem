using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Categories.Commands;

public record DeleteCategoryCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteCategoryCommandHandler
    : IRequestHandler<DeleteCategoryCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public DeleteCategoryCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<bool>> Handle(
        DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _uow.Categories.GetByIdAsync(request.Id, cancellationToken);
        if (category is null)
            return ApiResponse<bool>.ErrorResponse("Category not found.");

        await _uow.Categories.DeleteAsync(category, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Category deleted successfully.");
    }
}
