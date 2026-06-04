using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Categories.Commands;

public record DeleteCategoryCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class DeleteCategoryCommandHandler(IUnitOfWork uow)
        : IRequestHandler<DeleteCategoryCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await uow.Categories.GetByIdAsync(request.Id, cancellationToken);
        if (category is null)
            throw new NotFoundException("Category not found.", "ID");

        await uow.Categories.DeleteAsync(category, cancellationToken);
        await uow.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Category deleted successfully.");
    }
}

