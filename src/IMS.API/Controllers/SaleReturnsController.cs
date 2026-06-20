using IMS.Application.Common;
using IMS.Application.Constants;
using IMS.Application.Features.SalesReturns;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/sale-returns")]
[Authorize]
public class SaleReturnsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SaleReturnListDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetAllSaleReturnsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SaleReturnDetailDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetSaleReturnByIdQuery(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateSaleReturnCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateSaleReturnCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteSaleReturnCommand(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = Policies.CanTransition)]
    public async Task<ActionResult<ApiResponse<bool>>> Approve(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ApproveSaleReturnCommand(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = Policies.CanTransition)]
    public async Task<ActionResult<ApiResponse<bool>>> Reject(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new RejectSaleReturnCommand(id), cancellationToken);

        return Ok(result);
    }
}

