using IMS.Application.Common;
using IMS.Application.Features.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserListDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetAllUsersQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> GetById(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetUserByIdQuery(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<string>>> Create([FromBody] CreateUserCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(string id, [FromBody] UpdateUserCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteUserCommand(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost("{id}/toggle-status")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleStatus(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ToggleUserStatusCommand(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost("{id}/change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword(string id, [FromBody] ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }
}

