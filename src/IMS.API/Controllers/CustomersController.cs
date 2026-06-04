using IMS.Application.Common;
using IMS.Application.Features.Customers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CustomerDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetAllCustomersQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCustomerByIdQuery(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateCustomerCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateCustomerCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteCustomerCommand(id), cancellationToken);

        return Ok(result);
    }
}

