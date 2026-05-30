using IMS.Application.Common;
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
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetAll()
    {
        var response = await _mediator.Send(new GetAllProductsQuery());
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(Guid id)
    {
        var response = await _mediator.Send(new GetProductByIdQuery(id));
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetLowStock()
    {
        var response = await _mediator.Send(new GetLowStockProductsQuery());
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateProductCommand command)
    {
        var response = await _mediator.Send(command);
        if (!response.Success)
            return BadRequest(response);

        return CreatedAtAction(nameof(GetById), new { id = response.Data }, response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var command = new UpdateProductCommand(
            Id: id,
            Name: request.Name,
            SKU: request.SKU,
            Description: request.Description,
            CategoryId: request.CategoryId,
            UnitId: request.UnitId,
            CostPrice: request.CostPrice,
            SalePrice: request.SalePrice,
            StockQuantity: request.StockQuantity,
            AlertQuantity: request.AlertQuantity,
            ImageUrl: request.ImageUrl
        );

        var response = await _mediator.Send(command);
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var response = await _mediator.Send(new DeleteProductCommand(id));
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }
}
