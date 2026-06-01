using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Suppliers;

public class GetAllSuppliersQuery : IRequest<ApiResponse<List<SupplierDto>>>;

public class GetAllSuppliersQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllSuppliersQuery, ApiResponse<List<SupplierDto>>>
{
    public async Task<ApiResponse<List<SupplierDto>>> Handle(GetAllSuppliersQuery request, CancellationToken cancellationToken)
    {
        var suppliers = await unitOfWork.Suppliers.GetAllAsync(cancellationToken);
        var result = suppliers.Select(s => new SupplierDto
        {
            Id = s.Id,
            Name = s.Name,
            Email = s.Email,
            Phone = s.Phone,
            Address = s.Address
        }).ToList();

        return ApiResponse<List<SupplierDto>>.SuccessResponse(result);
    }
}