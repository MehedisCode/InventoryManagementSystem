using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Units;

public class GetUnitByIdQuery(Guid id) : IRequest<ApiResponse<UnitDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetUnitByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetUnitByIdQuery, ApiResponse<UnitDto>>
{
    public async Task<ApiResponse<UnitDto>> Handle(GetUnitByIdQuery request, CancellationToken cancellationToken)
    {
        var unit = await unitOfWork.Units.GetByIdAsync(request.Id, cancellationToken);
        if (unit == null)
            throw new NotFoundException("Unit not found.", "ID");

        var result = new UnitDto
        {
            Id = unit.Id,
            Name = unit.Name,
            ShortName = unit.ShortName
        };

        return ApiResponse<UnitDto>.SuccessResponse(result);
    }
}

