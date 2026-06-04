using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Suppliers;

public class GetSupplierByIdQuery(Guid id) : IRequest<ApiResponse<SupplierDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetSupplierByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetSupplierByIdQuery, ApiResponse<SupplierDto>>
{
    public async Task<ApiResponse<SupplierDto>> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var supplier = await unitOfWork.Suppliers.GetByIdAsync(request.Id, cancellationToken);
        if (supplier == null)
            throw new NotFoundException("Supplier not found.", "ID");

        var result = new SupplierDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            Email = supplier.Email,
            Phone = supplier.Phone,
            Address = supplier.Address
        };

        return ApiResponse<SupplierDto>.SuccessResponse(result);
    }
}
