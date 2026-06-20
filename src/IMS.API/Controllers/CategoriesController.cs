using IMS.Application.Common;
using IMS.Application.Constants;
using IMS.Application.Features.Categories.Commands;
using IMS.Application.Features.Categories.DTOs;
using IMS.Application.Features.Categories.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll()
    {
        var response = await mediator.Send(new GetAllCategoriesQuery());
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(Guid id)
    {
        var response = await mediator.Send(new GetCategoryByIdQuery(id));
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateCategoryCommand command)
    {
        var response = await mediator.Send(command);
        if (!response.Success)
            return BadRequest(response);

        return CreatedAtAction(nameof(GetById), new { id = response.Data }, response);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var command = new UpdateCategoryCommand(
            Id: id,
            Name: request.Name,
            Description: request.Description
        );

        var response = await mediator.Send(command);
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = Policies.CanWriteInventory)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var response = await mediator.Send(new DeleteCategoryCommand(id));
        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }
}
