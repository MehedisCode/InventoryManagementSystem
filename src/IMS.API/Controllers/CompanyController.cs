using IMS.Application.Common;
using IMS.Application.Features.Company;
using IMS.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/setup/company")]
[Authorize(Roles = Roles.Admin)]
public class CompanyController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<CompanyDto>>> GetSettings(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCompanySettingsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateSettings([FromBody] UpdateCompanySettingsCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }
}

