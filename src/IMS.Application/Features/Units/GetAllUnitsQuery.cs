using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Units;

public class GetAllUnitsQuery : IRequest<ApiResponse<List<UnitDto>>>;

public class GetAllUnitsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllUnitsQuery, ApiResponse<List<UnitDto>>>
{
    public async Task<ApiResponse<List<UnitDto>>> Handle(GetAllUnitsQuery request, CancellationToken cancellationToken)
    {
        var units = await unitOfWork.Units.GetAllAsync(cancellationToken);

        var result = units.Select(u => new UnitDto
        {
            Id = u.Id,
            Name = u.Name,
            ShortName = u.ShortName
        }).ToList();

        return ApiResponse<List<UnitDto>>.SuccessResponse(result);
    }
}
