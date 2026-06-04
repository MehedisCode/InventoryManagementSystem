using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Suppliers;

public class DeleteSupplierCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class DeleteSupplierCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteSupplierCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await unitOfWork.Suppliers.GetByIdAsync(request.Id, cancellationToken);
        if (supplier == null) throw new NotFoundException("Supplier not found.", "ID");

        await unitOfWork.Suppliers.DeleteAsync(supplier, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Supplier deleted successfully.");
    }
}

