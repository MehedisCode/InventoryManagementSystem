using FluentValidation;
using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Units;

public class UpdateUnitCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
}

public class UpdateUnitCommandValidator : AbstractValidator<UpdateUnitCommand>
{
    public UpdateUnitCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ShortName).NotEmpty().MaximumLength(10);
    }
}

public class UpdateUnitCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateUnitCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await unitOfWork.Units.GetByIdAsync(request.Id, cancellationToken);
        if (unit == null)
            throw new NotFoundException("Unit not found.", "ID");

        unit.Name = request.Name;
        unit.ShortName = request.ShortName;

        await unitOfWork.Units.UpdateAsync(unit, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Unit updated successfully.");
    }
}

