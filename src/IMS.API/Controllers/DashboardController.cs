using MediatR;
using IMS.Application.Common;
using IMS.Application.Features.Dashboard;
using IMS.Domain.Constants;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class DashboardController(IMediator mediator) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<DashboardSummaryDto>>> GetSummary(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetDashboardSummaryQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("monthly-chart")]
    public async Task<ActionResult<ApiResponse<List<MonthlyChartDto>>>> GetMonthlyChart(
        [FromQuery] int year,
        CancellationToken cancellationToken)
    {
        if (year == 0) year = DateTime.UtcNow.Year;
        var result = await mediator.Send(new GetMonthlySalesChartQuery { Year = year }, cancellationToken);
        return Ok(result);
    }

    [HttpGet("top-products")]
    public async Task<ActionResult<ApiResponse<List<TopProductDto>>>> GetTopProducts(
        [FromQuery] int count = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetTopSellingProductsQuery { TopCount = count }, cancellationToken);
        return Ok(result);
    }
}
