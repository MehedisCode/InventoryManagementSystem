using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Dashboard;

public class GetMonthlySalesChartQuery : IRequest<ApiResponse<List<MonthlyChartDto>>>
{
    public int Year { get; set; }
}

public class GetMonthlySalesChartQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMonthlySalesChartQuery, ApiResponse<List<MonthlyChartDto>>>
{
    public async Task<ApiResponse<List<MonthlyChartDto>>> Handle(GetMonthlySalesChartQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year;

        var sales = await unitOfWork.Sales.GetAllAsync(cancellationToken);
        var purchases = await unitOfWork.Purchases.GetAllAsync(cancellationToken);

        var yearSales = sales
            .Where(s => s.Status == SaleStatus.Completed && s.SaleDate.Year == year)
            .ToList();

        // Fixed to Received
        var yearPurchases = purchases
            .Where(p => p.Status == PurchaseStatus.Received && p.PurchaseDate.Year == year)
            .ToList();

        var result = new List<MonthlyChartDto>();

        for (int month = 1; month <= 12; month++)
        {
            var monthlySalesAmount = yearSales
                .Where(s => s.SaleDate.Month == month)
                .Sum(s => s.TotalAmount);

            var monthlyPurchaseAmount = yearPurchases
                .Where(p => p.PurchaseDate.Month == month)
                .Sum(p => p.TotalAmount);

            result.Add(new MonthlyChartDto
            {
                Month = month,
                SalesAmount = monthlySalesAmount,
                PurchaseAmount = monthlyPurchaseAmount
            });
        }

        return ApiResponse<List<MonthlyChartDto>>.SuccessResponse(result);
    }
}
