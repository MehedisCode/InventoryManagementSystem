using IMS.Application.Common;
using IMS.Application.Constants;
using IMS.Application.Features.Suppliers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SuppliersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SupplierDto>>>> GetAll()
    {
        var response = await mediator.Send(new GetAllSuppliersQuery());
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> GetById(Guid id)
    {
        var response = await mediator.Send(new GetSupplierByIdQuery(id));
        if (!response.Success) return NotFound(response);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateSupplierCommand command)
    {
        var response = await mediator.Send(command);
        if (!response.Success) return BadRequest(response);
        return CreatedAtAction(nameof(GetById), new { id = response.Data }, response);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateSupplierCommand command)
    {
        if (id != command.Id) return BadRequest(ApiResponse<bool>.ErrorResponse("ID mismatch."));
        var response = await mediator.Send(command);
        if (!response.Success) return NotFound(response);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var response = await mediator.Send(new DeleteSupplierCommand(id));
        if (!response.Success) return NotFound(response);
        return Ok(response);
    }
}