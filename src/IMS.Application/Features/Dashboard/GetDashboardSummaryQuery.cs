using IMS.Application.Common;
using IMS.Application.Features.Products.DTOs;
using IMS.Application.Features.Purchases;
using IMS.Application.Features.Sales;
using IMS.Application.Interfaces;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Dashboard;

public class GetDashboardSummaryQuery : IRequest<ApiResponse<DashboardSummaryDto>>;

public class GetDashboardSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDashboardSummaryQuery, ApiResponse<DashboardSummaryDto>>
{
    public async Task<ApiResponse<DashboardSummaryDto>> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;
        var firstDayOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var allProducts = await unitOfWork.Products.GetAllAsync(cancellationToken);
        var lowStockProducts = allProducts.Where(p => p.StockQuantity <= p.AlertQuantity).ToList();

        var categoriesCount = await unitOfWork.Categories.CountAsync(cancellationToken: cancellationToken);
        var suppliersCount = await unitOfWork.Suppliers.CountAsync(cancellationToken: cancellationToken);
        var customersCount = await unitOfWork.Customers.CountAsync(cancellationToken: cancellationToken);

        var sales = await unitOfWork.Sales.GetAllWithCustomersAsync(cancellationToken);
        var purchases = await unitOfWork.Purchases.GetAllWithSuppliersAsync(cancellationToken);
        var saleReturns = await unitOfWork.SaleReturns.GetAllAsync(cancellationToken);

        // Sales Summary
        var completedSales = sales.Where(s => s.Status == SaleStatus.Completed).ToList();
        var todaySales = completedSales.Where(s => s.SaleDate.Date == today).ToList();
        var monthlySales = completedSales.Where(s => s.SaleDate >= firstDayOfMonth).ToList();

        // Purchase Summary - Fixed to Received
        var completedPurchases = purchases.Where(p => p.Status == PurchaseStatus.Received).ToList();
        var todayPurchases = completedPurchases.Where(p => p.PurchaseDate.Date == today).ToList();
        var monthlyPurchases = completedPurchases.Where(p => p.PurchaseDate >= firstDayOfMonth).ToList();

        // Returns
        var monthlyReturns = saleReturns
            .Where(r => r.Status == ReturnStatus.Approved && r.ReturnDate >= firstDayOfMonth)
            .ToList();

        var totalMonthlySalesAmount = monthlySales.Sum(s => s.TotalAmount);
        var totalMonthlyReturnsAmount = monthlyReturns.Sum(r => r.TotalAmount);
        var totalRevenueThisMonth = totalMonthlySalesAmount - totalMonthlyReturnsAmount;
        var totalPurchaseCostThisMonth = monthlyPurchases.Sum(p => p.TotalAmount);
        var totalProfitThisMonth = totalRevenueThisMonth - totalPurchaseCostThisMonth;

        var result = new DashboardSummaryDto
        {
            TotalProducts = allProducts.Count,
            LowStockProductsCount = lowStockProducts.Count,
            TotalCategories = categoriesCount,
            TotalSuppliers = suppliersCount,
            TotalCustomers = customersCount,

            TodaySalesCount = todaySales.Count,
            TodaySalesAmount = todaySales.Sum(s => s.TotalAmount),
            MonthlySalesAmount = totalMonthlySalesAmount,
            TotalSalesAmount = completedSales.Sum(s => s.TotalAmount),

            TodayPurchasesCount = todayPurchases.Count,
            TodayPurchasesAmount = todayPurchases.Sum(p => p.TotalAmount),
            MonthlyPurchasesAmount = totalPurchaseCostThisMonth,
            TotalPurchasesAmount = completedPurchases.Sum(p => p.TotalAmount),

            TotalRevenueThisMonth = totalRevenueThisMonth,
            TotalPurchaseCostThisMonth = totalPurchaseCostThisMonth,
            TotalProfitThisMonth = totalProfitThisMonth,

            RecentSales = sales.OrderByDescending(s => s.CreatedAt).Take(5).Select(s => new SaleListDto
            {
                Id = s.Id,
                ReferenceNo = s.ReferenceNo,
                CustomerName = s.Customer.Name,
                SaleDate = s.SaleDate,
                TotalAmount = s.TotalAmount,
                Status = s.Status
            }).ToList(),

            RecentPurchases = purchases.OrderByDescending(p => p.CreatedAt).Take(5).Select(p => new PurchaseListDto
            {
                Id = p.Id,
                ReferenceNo = p.ReferenceNo,
                SupplierName = p.Supplier.Name,
                PurchaseDate = p.PurchaseDate,
                TotalAmount = p.TotalAmount,
                Status = p.Status
            }).ToList(),

            LowStockProducts = lowStockProducts.OrderBy(p => p.StockQuantity).Take(10).Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                Description = p.Description,
                StockQuantity = p.StockQuantity,
                AlertQuantity = p.AlertQuantity,
                SalePrice = p.SalePrice,
                CostPrice = p.CostPrice,
                CategoryName = p.Category.Name,
                UnitName = p.Unit.Name,
                ImageUrl = p.ImageUrl
            }).ToList()
        };

        return ApiResponse<DashboardSummaryDto>.SuccessResponse(result);
    }
}

