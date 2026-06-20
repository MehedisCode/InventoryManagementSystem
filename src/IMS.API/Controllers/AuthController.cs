using System.Security.Claims;
using IMS.Application.Common;
using IMS.Application.Features.Auth.Login;
using IMS.Application.Features.Auth.Me;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginCommand command)
    {
        var response = await mediator.Send(command);
        if (!response.Success)
        {
            return Unauthorized(response);
        }
        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<MeResponse>>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var response = await mediator.Send(new MeQuery(userId ?? string.Empty));
        return Ok(response);
    }
}
