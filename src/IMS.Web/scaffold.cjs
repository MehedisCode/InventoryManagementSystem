const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "src");

const dirsToCreate = [
  "api",
  "store",
  "hooks",
  "components/layout",
  "components/ui",
  "components/shared",
  "pages/auth",
  "pages/dashboard",
  "pages/products",
  "pages/categories",
  "pages/purchases",
  "pages/suppliers",
  "pages/sales",
  "pages/saleReturns",
  "pages/quotations",
  "pages/balanceTransfers",
  "pages/customers",
  "pages/users",
  "pages/roles",
  "pages/setup",
  "utils",
];

const filesToCreate = {
  "api/axiosInstance.js": `import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
});

axiosInstance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;`,
  "api/authApi.js": `import axiosInstance from './axiosInstance';\nexport const login = (data) => axiosInstance.post('/auth/login', data);\n`,
  "api/productApi.js": `import axiosInstance from './axiosInstance';\nexport const getProducts = () => axiosInstance.get('/products');\nexport const getProduct = (id) => axiosInstance.get(\`/products/\${id}\`);\nexport const createProduct = (data) => axiosInstance.post('/products', data);\nexport const updateProduct = (id, data) => axiosInstance.put(\`/products/\${id}\`, data);\nexport const deleteProduct = (id) => axiosInstance.delete(\`/products/\${id}\`);\n`,
  "api/categoryApi.js": `import axiosInstance from './axiosInstance';\nexport const getCategories = () => axiosInstance.get('/categories');\nexport const getCategory = (id) => axiosInstance.get(\`/categories/\${id}\`);\nexport const createCategory = (data) => axiosInstance.post('/categories', data);\nexport const updateCategory = (id, data) => axiosInstance.put(\`/categories/\${id}\`, data);\nexport const deleteCategory = (id) => axiosInstance.delete(\`/categories/\${id}\`);\n`,
  "api/purchaseApi.js": `import axiosInstance from './axiosInstance';\nexport const getPurchases = () => axiosInstance.get('/purchases');\nexport const getPurchase = (id) => axiosInstance.get(\`/purchases/\${id}\`);\nexport const createPurchase = (data) => axiosInstance.post('/purchases', data);\nexport const updatePurchase = (id, data) => axiosInstance.put(\`/purchases/\${id}\`, data);\nexport const deletePurchase = (id) => axiosInstance.delete(\`/purchases/\${id}\`);\n`,
  "api/supplierApi.js": `import axiosInstance from './axiosInstance';\nexport const getSuppliers = () => axiosInstance.get('/suppliers');\nexport const getSupplier = (id) => axiosInstance.get(\`/suppliers/\${id}\`);\nexport const createSupplier = (data) => axiosInstance.post('/suppliers', data);\nexport const updateSupplier = (id, data) => axiosInstance.put(\`/suppliers/\${id}\`, data);\nexport const deleteSupplier = (id) => axiosInstance.delete(\`/suppliers/\${id}\`);\n`,
  "api/saleApi.js": `import axiosInstance from './axiosInstance';\nexport const getSales = () => axiosInstance.get('/sales');\nexport const getSale = (id) => axiosInstance.get(\`/sales/\${id}\`);\nexport const createSale = (data) => axiosInstance.post('/sales', data);\nexport const updateSale = (id, data) => axiosInstance.put(\`/sales/\${id}\`, data);\nexport const deleteSale = (id) => axiosInstance.delete(\`/sales/\${id}\`);\n`,
  "api/saleReturnApi.js": `import axiosInstance from './axiosInstance';\nexport const getSaleReturns = () => axiosInstance.get('/saleReturns');\nexport const getSaleReturn = (id) => axiosInstance.get(\`/saleReturns/\${id}\`);\nexport const createSaleReturn = (data) => axiosInstance.post('/saleReturns', data);\nexport const updateSaleReturn = (id, data) => axiosInstance.put(\`/saleReturns/\${id}\`, data);\nexport const deleteSaleReturn = (id) => axiosInstance.delete(\`/saleReturns/\${id}\`);\n`,
  "api/quotationApi.js": `import axiosInstance from './axiosInstance';\nexport const getQuotations = () => axiosInstance.get('/quotations');\nexport const getQuotation = (id) => axiosInstance.get(\`/quotations/\${id}\`);\nexport const createQuotation = (data) => axiosInstance.post('/quotations', data);\nexport const updateQuotation = (id, data) => axiosInstance.put(\`/quotations/\${id}\`, data);\nexport const deleteQuotation = (id) => axiosInstance.delete(\`/quotations/\${id}\`);\n`,
  "api/balanceTransferApi.js": `import axiosInstance from './axiosInstance';\nexport const getBalanceTransfers = () => axiosInstance.get('/balanceTransfers');\nexport const getBalanceTransfer = (id) => axiosInstance.get(\`/balanceTransfers/\${id}\`);\nexport const createBalanceTransfer = (data) => axiosInstance.post('/balanceTransfers', data);\nexport const updateBalanceTransfer = (id, data) => axiosInstance.put(\`/balanceTransfers/\${id}\`, data);\nexport const deleteBalanceTransfer = (id) => axiosInstance.delete(\`/balanceTransfers/\${id}\`);\n`,
  "api/dashboardApi.js": `import axiosInstance from './axiosInstance';\nexport const getDashboardStats = () => axiosInstance.get('/dashboard/stats');\n`,
  "api/userApi.js": `import axiosInstance from './axiosInstance';\nexport const getUsers = () => axiosInstance.get('/users');\nexport const getUser = (id) => axiosInstance.get(\`/users/\${id}\`);\nexport const createUser = (data) => axiosInstance.post('/users', data);\nexport const updateUser = (id, data) => axiosInstance.put(\`/users/\${id}\`, data);\nexport const deleteUser = (id) => axiosInstance.delete(\`/users/\${id}\`);\n`,
  "api/roleApi.js": `import axiosInstance from './axiosInstance';\nexport const getRoles = () => axiosInstance.get('/roles');\nexport const getRole = (id) => axiosInstance.get(\`/roles/\${id}\`);\nexport const createRole = (data) => axiosInstance.post('/roles', data);\nexport const updateRole = (id, data) => axiosInstance.put(\`/roles/\${id}\`, data);\nexport const deleteRole = (id) => axiosInstance.delete(\`/roles/\${id}\`);\n`,
  "api/setupApi.js": `import axiosInstance from './axiosInstance';\nexport const getSetupSettings = () => axiosInstance.get('/setup');\nexport const updateSetupSettings = (data) => axiosInstance.put('/setup', data);\n`,
  "store/authStore.js": `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (userData, token) => set({ user: userData, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
            setUser: (user) => set({ user }),
        }),
        {
            name: 'auth-storage',
        }
    )
);`,
  "store/themeStore.js": `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            isDark: false,
            toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
        }),
        {
            name: 'theme-storage',
        }
    )
);`,
  "hooks/useAuth.js": `import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
    const { user, token, isAuthenticated, login, logout } = useAuthStore();
    return { user, token, isAuthenticated, login, logout };
};`,
  "utils/formatters.js": `import { format } from 'date-fns';

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const formatStatus = (status) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};`,
  "utils/constants.js": `export const PURCHASE_STATUS = { 0: 'Pending', 1: 'Received', 2: 'Cancelled' };
export const SALE_STATUS = { 0: 'Pending', 1: 'Completed', 2: 'Cancelled' };
export const RETURN_STATUS = { 0: 'Pending', 1: 'Approved', 2: 'Rejected' };
export const TRANSFER_STATUS = { 0: 'Pending', 1: 'Completed', 2: 'Cancelled' };
export const QUOTATION_STATUS = { 0: 'Draft', 1: 'Sent', 2: 'Accepted', 3: 'Rejected' };`,
  "components/layout/MainLayout.jsx": `import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import PageWrapper from './PageWrapper';
import { useAuth } from '../../hooks/useAuth';

const MainLayout = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    return (
        <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-slate-900 dark:text-slate-100">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <PageWrapper>
                    <Outlet />
                </PageWrapper>
            </div>
        </div>
    );
};
export default MainLayout;`,
  "components/layout/Sidebar.jsx": `import { Link } from 'react-router-dom';\nexport default function Sidebar() { return <div className="w-64 bg-white dark:bg-dark-card border-r border-light-border dark:border-dark-border p-4">Sidebar</div>; }`,
  "components/layout/Header.jsx": `import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';

export default function Header() { 
    const { toggleTheme, isDark } = useThemeStore();
    const { logout } = useAuth();
    return (
        <header className="h-16 bg-white dark:bg-dark-card border-b border-light-border dark:border-dark-border flex items-center justify-between px-6">
            <h1 className="text-xl font-bold">IMS</h1>
            <div className="flex gap-4">
                <button onClick={toggleTheme}>{isDark ? 'Light' : 'Dark'} Mode</button>
                <button onClick={logout}>Logout</button>
            </div>
        </header>
    ); 
}`,
  "components/layout/PageWrapper.jsx": `export default function PageWrapper({ children }) { return <main className="flex-1 overflow-auto p-6">{children}</main>; }`,
  "components/ui/Button.jsx": `export default function Button({ children, ...props }) { return <button className="px-4 py-2 bg-accent text-white rounded" {...props}>{children}</button>; }`,
  "components/ui/Input.jsx": `import { forwardRef } from 'react';
export const Input = forwardRef((props, ref) => <input ref={ref} className="border p-2 rounded dark:bg-slate-800 dark:border-slate-700" {...props} />);
Input.displayName = 'Input';
export default Input;`,
  "components/ui/Select.jsx": `export default function Select(props) { return <select className="border p-2 rounded dark:bg-slate-800 dark:border-slate-700" {...props} />; }`,
  "components/ui/Modal.jsx": `export default function Modal({ children, isOpen }) { if(!isOpen) return null; return <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="bg-white dark:bg-dark-card p-6 rounded">{children}</div></div>; }`,
  "components/ui/Table.jsx": `export default function Table({ children }) { return <table className="w-full text-left border-collapse">{children}</table>; }`,
  "components/ui/Badge.jsx": `export default function Badge({ children }) { return <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">{children}</span>; }`,
  "components/ui/Card.jsx": `export default function Card({ children }) { return <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">{children}</div>; }`,
  "components/ui/Spinner.jsx": `export default function Spinner() { return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>; }`,
  "components/ui/ConfirmDialog.jsx": `export default function ConfirmDialog({ isOpen, onConfirm, onCancel }) { if(!isOpen) return null; return <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="bg-white p-4 rounded"><p>Are you sure?</p><div className="flex gap-2 mt-4"><button onClick={onCancel}>Cancel</button><button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Confirm</button></div></div></div>; }`,
  "components/ui/PageHeader.jsx": `export default function PageHeader({ title }) { return <div className="mb-6"><h1 className="text-2xl font-bold">{title}</h1></div>; }`,
  "components/shared/DataTable.jsx": `export default function DataTable() { return <div>DataTable Data...</div>; }`,
  "components/shared/FormError.jsx": `export default function FormError({ message }) { return message ? <p className="text-red-500 text-sm mt-1">{message}</p> : null; }`,
  "pages/auth/LoginPage.jsx": `import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleLogin = () => {
        login({ id: 1, name: 'Admin' }, 'fake-jwt-token');
        navigate('/dashboard');
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
            <div className="bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">Login</h1>
                <button onClick={handleLogin} className="w-full bg-accent hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">Login as Admin</button>
            </div>
        </div>
    );
}`,
  "pages/dashboard/DashboardPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function DashboardPage() { return <div><PageHeader title="Dashboard" /><p>Welcome to IMS.</p></div>; }`,
  "pages/products/ProductsPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function ProductsPage() { return <div><PageHeader title="Products" /></div>; }`,
  "pages/products/ProductForm.jsx": `export default function ProductForm() { return <div>ProductForm</div>; }`,
  "pages/categories/CategoriesPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function CategoriesPage() { return <div><PageHeader title="Categories" /></div>; }`,
  "pages/purchases/PurchasesPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function PurchasesPage() { return <div><PageHeader title="Purchases" /></div>; }`,
  "pages/purchases/PurchaseForm.jsx": `export default function PurchaseForm() { return <div>PurchaseForm</div>; }`,
  "pages/suppliers/SuppliersPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function SuppliersPage() { return <div><PageHeader title="Suppliers" /></div>; }`,
  "pages/sales/SalesPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function SalesPage() { return <div><PageHeader title="Sales" /></div>; }`,
  "pages/sales/SaleForm.jsx": `export default function SaleForm() { return <div>SaleForm</div>; }`,
  "pages/saleReturns/SaleReturnsPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function SaleReturnsPage() { return <div><PageHeader title="Sale Returns" /></div>; }`,
  "pages/quotations/QuotationsPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function QuotationsPage() { return <div><PageHeader title="Quotations" /></div>; }`,
  "pages/quotations/QuotationForm.jsx": `export default function QuotationForm() { return <div>QuotationForm</div>; }`,
  "pages/balanceTransfers/BalanceTransfersPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function BalanceTransfersPage() { return <div><PageHeader title="Balance Transfers" /></div>; }`,
  "pages/customers/CustomersPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function CustomersPage() { return <div><PageHeader title="Customers" /></div>; }`,
  "pages/users/UsersPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function UsersPage() { return <div><PageHeader title="Users" /></div>; }`,
  "pages/roles/RolesPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function RolesPage() { return <div><PageHeader title="Roles" /></div>; }`,
  "pages/setup/SetupPage.jsx": `import PageHeader from '../../components/ui/PageHeader';\nexport default function SetupPage() { return <div><PageHeader title="Setup" /></div>; }`,
  "App.jsx": `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/themeStore';

import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import PurchasesPage from './pages/purchases/PurchasesPage';
import SalesPage from './pages/sales/SalesPage';
import SaleReturnsPage from './pages/saleReturns/SaleReturnsPage';
import QuotationsPage from './pages/quotations/QuotationsPage';
import BalanceTransfersPage from './pages/balanceTransfers/BalanceTransfersPage';
import CustomersPage from './pages/customers/CustomersPage';
import UsersPage from './pages/users/UsersPage';
import RolesPage from './pages/roles/RolesPage';
import SetupPage from './pages/setup/SetupPage';

const queryClient = new QueryClient();

function App() {
    const isDark = useThemeStore((state) => state.isDark);

    return (
        <QueryClientProvider client={queryClient}>
            <div className={isDark ? 'dark' : ''}>
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
                            <Route path="balance-transfers" element={<BalanceTransfersPage />} />
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

export default App;`,
};

dirsToCreate.forEach((dir) => {
  fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
});

Object.entries(filesToCreate).forEach(([filePath, content]) => {
  fs.writeFileSync(path.join(baseDir, filePath), content);
});

console.log("Scaffolding complete!");
