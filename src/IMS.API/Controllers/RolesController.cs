using IMS.Application.Common;
using IMS.Application.Features.Roles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = "Admin")]
public class RolesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetAllRolesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> GetById(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetRoleByIdQuery(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<string>>> Create([FromBody] CreateRoleCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(string id, [FromBody] UpdateRoleCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteRoleCommand(id), cancellationToken);

        return Ok(result);
    }
}

