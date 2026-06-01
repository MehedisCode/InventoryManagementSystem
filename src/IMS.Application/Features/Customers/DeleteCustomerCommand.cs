using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Customers;

public class DeleteCustomerCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public DeleteCustomerCommand(Guid id) => Id = id;
}

public class DeleteCustomerCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteCustomerCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await unitOfWork.Customers.GetByIdAsync(request.Id, cancellationToken);
        if (customer == null)
            return ApiResponse<bool>.ErrorResponse("Customer not found.");

        await unitOfWork.Customers.DeleteAsync(customer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Customer deleted successfully.");
    }
}
