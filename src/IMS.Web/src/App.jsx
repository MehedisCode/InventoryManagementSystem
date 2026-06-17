import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/themeStore";

import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/products/ProductsPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import SuppliersPage from "./pages/suppliers/SuppliersPage";
import PurchasesPage from "./pages/purchases/PurchasesPage";
import SalesPage from "./pages/sales/SalesPage";
import SaleReturnsPage from "./pages/saleReturns/SaleReturnsPage";
import QuotationsPage from "./pages/quotations/QuotationsPage";
import BalanceTransfersPage from "./pages/balanceTransfers/BalanceTransfersPage";
import CustomersPage from "./pages/customers/CustomersPage";
import UsersPage from "./pages/users/UsersPage";
import RolesPage from "./pages/roles/RolesPage";
import SetupPage from "./pages/setup/SetupPage";

const queryClient = new QueryClient();

function App() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={isDark ? "dark" : ""}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="sale-returns" element={<SaleReturnsPage />} />
              <Route path="quotations" element={<QuotationsPage />} />
              <Route
                path="balance-transfers"
                element={<BalanceTransfersPage />}
              />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="setup" element={<SetupPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
