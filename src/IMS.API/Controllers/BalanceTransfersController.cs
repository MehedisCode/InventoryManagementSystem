using IMS.Application.Common;
using IMS.Application.Features.BalanceTransfers;
using IMS.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/balance-transfers")]
[Authorize]
public class BalanceTransfersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BalanceTransferDto>>>> GetAll([FromQuery] TransferStatus? status, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetAllBalanceTransfersQuery { Status = status }, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<BalanceTransferDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetBalanceTransferByIdQuery(id), cancellationToken);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateBalanceTransferCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateBalanceTransferCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteBalanceTransferCommand(id), cancellationToken);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<ApiResponse<bool>>> Complete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CompleteTransferCommand(id), cancellationToken);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ApiResponse<bool>>> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CancelTransferCommand(id), cancellationToken);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
