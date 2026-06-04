using IMS.Application.Common;
using IMS.Application.Features.Sales;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/sales")]
[Authorize]
public class SalesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SaleListDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetAllSalesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SaleDetailDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetSaleByIdQuery(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateSaleCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateSaleCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteSaleCommand(id), cancellationToken);

        return Ok(result);
    }
}

