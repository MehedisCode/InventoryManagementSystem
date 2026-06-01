using IMS.Application.Common;
using IMS.Application.Features.Purchases;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PurchasesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PurchaseListDto>>>> GetAll()
    {
        var response = await mediator.Send(new GetAllPurchasesQuery());
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<PurchaseDetailDto>>> GetById(Guid id)
    {
        var response = await mediator.Send(new GetPurchaseByIdQuery(id));
        if (!response.Success) return NotFound(response);
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreatePurchaseCommand command)
    {
        var response = await mediator.Send(command);
        if (!response.Success) return BadRequest(response);
        return CreatedAtAction(nameof(GetById), new { id = response.Data }, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdatePurchaseCommand command)
    {
        if (id != command.Id) return BadRequest(ApiResponse<bool>.ErrorResponse("ID mismatch."));
        var response = await mediator.Send(command);
        if (!response.Success) return NotFound(response);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var response = await mediator.Send(new DeletePurchaseCommand(id));
        if (!response.Success) return NotFound(response);
        return Ok(response);
    }
}