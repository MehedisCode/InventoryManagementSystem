using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Customers;

public class DeleteCustomerCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class DeleteCustomerCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteCustomerCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await unitOfWork.Customers.GetByIdAsync(request.Id, cancellationToken);
        if (customer == null)
            throw new NotFoundException("Customer not found.", "ID");

        await unitOfWork.Customers.DeleteAsync(customer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Customer deleted successfully.");
    }
}

