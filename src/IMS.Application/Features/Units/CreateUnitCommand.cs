using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;
using Unit = IMS.Domain.Entities.Unit;

namespace IMS.Application.Features.Units;

public class CreateUnitCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
}

public class CreateUnitCommandValidator : AbstractValidator<CreateUnitCommand>
{
    public CreateUnitCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ShortName).NotEmpty().MaximumLength(10);
    }
}

public class CreateUnitCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateUnitCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = new Unit
        {
            Name = request.Name,
            ShortName = request.ShortName
        };

        await unitOfWork.Units.AddAsync(unit, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(unit.Id, "Unit created successfully.");
    }
}
