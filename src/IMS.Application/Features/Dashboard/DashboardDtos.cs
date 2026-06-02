using IMS.Application.Features.Products.DTOs;
using IMS.Application.Features.Purchases;
using IMS.Application.Features.Sales;

namespace IMS.Application.Features.Dashboard;

public class DashboardSummaryDto
{
    // Overview Cards
    public int TotalProducts { get; set; }
    public int LowStockProductsCount { get; set; }
    public int TotalCategories { get; set; }
    public int TotalSuppliers { get; set; }
    public int TotalCustomers { get; set; }

    // Sales Summary
    public int TodaySalesCount { get; set; }
    public decimal TodaySalesAmount { get; set; }
    public decimal MonthlySalesAmount { get; set; }
    public decimal TotalSalesAmount { get; set; }

    // Purchase Summary
    public int TodayPurchasesCount { get; set; }
    public decimal TodayPurchasesAmount { get; set; }
    public decimal MonthlyPurchasesAmount { get; set; }
    public decimal TotalPurchasesAmount { get; set; }

    // Financial
    public decimal TotalRevenueThisMonth { get; set; }
    public decimal TotalPurchaseCostThisMonth { get; set; }
    public decimal TotalProfitThisMonth { get; set; }

    // Recent Data
    public List<SaleListDto> RecentSales { get; set; } = new();
    public List<PurchaseListDto> RecentPurchases { get; set; } = new();
    public List<ProductDto> LowStockProducts { get; set; } = new();
}

public class MonthlyChartDto
{
    public int Month { get; set; }
    public decimal SalesAmount { get; set; }
    public decimal PurchaseAmount { get; set; }
}

public class TopProductDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
}
