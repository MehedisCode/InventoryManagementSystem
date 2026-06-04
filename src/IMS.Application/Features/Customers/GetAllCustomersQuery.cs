using MediatR;
using IMS.Application.Common;
using IMS.Application.Interfaces;

namespace IMS.Application.Features.Customers;

public class GetAllCustomersQuery : IRequest<ApiResponse<List<CustomerDto>>>;

public class GetAllCustomersQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllCustomersQuery, ApiResponse<List<CustomerDto>>>
{
    public async Task<ApiResponse<List<CustomerDto>>> Handle(GetAllCustomersQuery request, CancellationToken cancellationToken)
    {
        var customers = await unitOfWork.Customers.GetAllAsync(cancellationToken);

        var result = customers.Select(c => new CustomerDto
        {
            Id = c.Id,
            Name = c.Name,
            Email = c.Email,
            Phone = c.Phone,
            Address = c.Address
        }).ToList();

        return ApiResponse<List<CustomerDto>>.SuccessResponse(result);
    }
}

