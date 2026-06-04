using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Customers;

public class GetCustomerByIdQuery(Guid id) : IRequest<ApiResponse<CustomerDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetCustomerByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetCustomerByIdQuery, ApiResponse<CustomerDto>>
{
    public async Task<ApiResponse<CustomerDto>> Handle(GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await unitOfWork.Customers.GetByIdAsync(request.Id, cancellationToken);
        if (customer == null)
            throw new NotFoundException("Customer not found.", "ID");

        var result = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            Phone = customer.Phone,
            Address = customer.Address
        };

        return ApiResponse<CustomerDto>.SuccessResponse(result);
    }
}

