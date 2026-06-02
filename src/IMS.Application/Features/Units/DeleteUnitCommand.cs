using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Units;

public class DeleteUnitCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class DeleteUnitCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteUnitCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await unitOfWork.Units.GetByIdAsync(request.Id, cancellationToken);
        if (unit == null)
            return ApiResponse<bool>.ErrorResponse("Unit not found.");

        await unitOfWork.Units.DeleteAsync(unit, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Unit deleted successfully.");
    }
}
