using IMS.Application.Common;
using IMS.Application.Features.Quotations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuotationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<QuotationListDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetAllQuotationsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<QuotationDetailDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetQuotationByIdQuery(id), cancellationToken);

        return Ok(result);
    }

    [HttpGet("expired")]
    public async Task<ActionResult<ApiResponse<List<QuotationListDto>>>> GetExpired(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetExpiredQuotationsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateQuotationCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateQuotationCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await mediator.Send(command, cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteQuotationCommand(id), cancellationToken);

        return Ok(result);
    }

    [HttpPost("{id:guid}/convert-to-sale")]
    public async Task<ActionResult<ApiResponse<Guid>>> ConvertToSale(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ConvertToSaleCommand(id), cancellationToken);

        return Ok(result);
    }
}

