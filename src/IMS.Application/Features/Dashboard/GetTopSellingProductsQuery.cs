using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Dashboard;

public class GetTopSellingProductsQuery : IRequest<ApiResponse<List<TopProductDto>>>
{
    public int TopCount { get; set; } = 10;
}

public class GetTopSellingProductsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetTopSellingProductsQuery, ApiResponse<List<TopProductDto>>>
{
    public async Task<ApiResponse<List<TopProductDto>>> Handle(GetTopSellingProductsQuery request, CancellationToken cancellationToken)
    {
        var sales = await unitOfWork.Sales.GetAllWithDetailsAsync(cancellationToken);

        var completedSales = sales.Where(s => s.Status == SaleStatus.Completed);

        var topProducts = completedSales
            .SelectMany(s => s.SaleItems)
            .GroupBy(si => new { si.ProductId, ProductName = si.Product.Name })
            .Select(g => new TopProductDto
            {
                ProductName = g.Key.ProductName,
                TotalQuantitySold = g.Sum(si => si.Quantity),
                TotalRevenue = g.Sum(si => si.SubTotal)
            })
            .OrderByDescending(tp => tp.TotalQuantitySold)
            .Take(request.TopCount)
            .ToList();

        return ApiResponse<List<TopProductDto>>.SuccessResponse(topProducts);
    }
}
