using IMS.Application.Common;
using IMS.Application.Constants;
using IMS.Application.Features.Products.Commands;
using IMS.Application.Features.Products.DTOs;
using IMS.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetAll()
    {
        var response = await mediator.Send(new GetAllProductsQuery());
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(Guid id)
    {
        var response = await mediator.Send(new GetProductByIdQuery(id));
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetLowStock()
    {
        var response = await mediator.Send(new GetLowStockProductsQuery());
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateProductCommand command)
    {
        var response = await mediator.Send(command);
        if (!response.Success)
            return BadRequest(response);

        return CreatedAtAction(nameof(GetById), new { id = response.Data }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateProductCommand command)
    {
        if (id != command.Id) return BadRequest(ApiResponse<bool>.ErrorResponse("ID mismatch."));


        var response = await mediator.Send(command);
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var response = await mediator.Send(new DeleteProductCommand(id));
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }
}
