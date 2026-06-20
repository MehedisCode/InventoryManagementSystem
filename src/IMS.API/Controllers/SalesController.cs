using MediatR;
using IMS.Application.Common;
using Microsoft.AspNetCore.Mvc;
using IMS.Application.Constants;
using IMS.Application.Features.Sales;
using Microsoft.AspNetCore.Authorization;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateSaleCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateSaleCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteSaleCommand(id), cancellationToken);

        return Ok(result);
    }
}

