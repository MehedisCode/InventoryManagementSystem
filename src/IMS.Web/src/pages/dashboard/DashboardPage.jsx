import { useQuery } from "@tanstack/react-query";
import {
  getSummary,
  getMonthlyChart,
  getTopProducts,
} from "../../api/dashboardApi";
import {
  Package,
  AlertTriangle,
  Tag,
  Truck,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { summary, chartInfo, topProducts } from "../../data/dashboardMockData";

// Helper Skeleton Component
const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
  />
);

export default function DashboardPage() {
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => getSummary().then((res) => res.data),
    retry: false,
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ["dashboardChart", new Date().getFullYear()],
    queryFn: () =>
      getMonthlyChart(new Date().getFullYear()).then((res) => res.data),
    retry: false,
  });

  const { data: topProductsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["dashboardTopProducts"],
    queryFn: () => getTopProducts(5).then((res) => res.data),
    retry: false,
  });

  const Trend = ({ value }) => {
    if (!value) return null;
    const isUp = value > 0;
    return (
      <div
        className={`flex items-center text-xs font-medium ${isUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
      >
        {isUp ? (
          <ArrowUpRight className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDownRight className="h-3 w-3 mr-1" />
        )}
        {Math.abs(value)}%
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your inventory and business performance"
      />

      {/* SECTION 1: Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            title: "Total Products",
            value: summary.totalProducts,
            trend: summary.productsTrend,
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            title: "Low Stock Alert",
            value: summary.lowStockAlerts,
            trend: null,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/30",
          },
          {
            title: "Total Categories",
            value: summary.totalCategories,
            trend: summary.categoriesTrend,
            icon: Tag,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/30",
          },
          {
            title: "Total Suppliers",
            value: summary.totalSuppliers,
            trend: summary.suppliersTrend,
            icon: Truck,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
          },
          {
            title: "Total Customers",
            value: summary.totalCustomers,
            trend: summary.customersTrend,
            icon: Users,
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/30",
          },
          {
            title: "Monthly Profit",
            value: formatCurrency(summary.monthlyProfit),
            trend: summary.profitTrend,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
          },
        ].map((stat, i) => (
          <Card key={i} padding="p-4" className="flex items-center gap-4">
            {isLoadingSummary ? (
              <>
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </>
            ) : (
              <>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.bg}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </h4>
                    {stat.trend !== null && <Trend value={stat.trend} />}
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* SECTION 2: Financial Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Today's Sales",
            amount: summary.todaysSalesAmount,
            count: summary.todaysSalesCount,
            border: "border-l-4 border-l-blue-500",
          },
          {
            title: "Monthly Sales",
            amount: summary.monthlySalesAmount,
            border: "border-l-4 border-l-emerald-500",
          },
          {
            title: "Monthly Purchases",
            amount: summary.monthlyPurchasesAmount,
            border: "border-l-4 border-l-orange-500",
          },
        ].map((fin, i) => (
          <Card key={i} className={fin.border} padding="p-5">
            {isLoadingSummary ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {fin.title}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {formatCurrency(fin.amount)}
                  </h3>
                  {fin.count !== undefined && (
                    <p className="text-xs text-slate-400 mt-1">
                      {fin.count} transactions today
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* SECTION 3: Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card title="Sales vs Purchases" className="lg:col-span-3">
          {isLoadingChart ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartInfo}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorPurchases"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [formatCurrency(value), undefined]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="purchases"
                    name="Purchases"
                    stroke="#1e3a5f"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPurchases)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Top Selling Products" className="lg:col-span-2">
          {isLoadingProducts ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    width={120}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* SECTION 4: Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Sales" padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref No</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {isLoadingSummary
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan="4" className="px-4 py-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : summary.recentSales.map((sale, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {sale.refNo}
                        </td>
                        <td className="px-4 py-3">{sale.customer}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(sale.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={sale.status}>{sale.status}</Badge>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-light-border dark:border-dark-border text-center">
            <a
              href="/sales"
              className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View All Sales
            </a>
          </div>
        </Card>

        <Card title="Recent Purchases" padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref No</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {isLoadingSummary
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan="4" className="px-4 py-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : summary.recentPurchases.map((purchase, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {purchase.refNo}
                        </td>
                        <td className="px-4 py-3">{purchase.supplier}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(purchase.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={purchase.status}>
                            {purchase.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-light-border dark:border-dark-border text-center">
            <a
              href="/purchases"
              className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View All Purchases
            </a>
          </div>
        </Card>
      </div>

      {/* SECTION 5: Low Stock Products */}
      <Card title="Low Stock Products" padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Stock Qty</th>
                <th className="px-6 py-3 font-medium">Alert Qty</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {isLoadingSummary
                ? [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="6" className="px-6 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : summary.lowStockProducts.map((product, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        product.stockQty === 0
                          ? "bg-red-50 dark:bg-red-900/10"
                          : product.stockQty <= product.alertQty
                            ? "bg-yellow-50 dark:bg-yellow-900/10"
                            : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {product.product}
                      </td>
                      <td className="px-6 py-4">{product.sku}</td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td
                        className={`px-6 py-4 font-bold ${product.stockQty === 0 ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}
                      >
                        {product.stockQty}
                      </td>
                      <td className="px-6 py-4">{product.alertQty}</td>
                      <td className="px-6 py-4">
                        <Badge
                          status={
                            product.stockQty === 0 ? "cancelled" : "pending"
                          }
                        >
                          {product.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
