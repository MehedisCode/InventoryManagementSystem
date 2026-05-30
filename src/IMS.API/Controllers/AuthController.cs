using IMS.Application.Common;
using IMS.Application.Features.Auth.Login;
using IMS.Application.Features.Auth.Register;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<string>>> Register([FromBody] RegisterCommand command)
    {
        var response = await _mediator.Send(command);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginCommand command)
    {
        var response = await _mediator.Send(command);
        if (!response.Success)
        {
            return Unauthorized(response);
        }
        return Ok(response);
    }
}
