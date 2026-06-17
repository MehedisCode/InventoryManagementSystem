import { NavLink } from 'react-router-dom';
import { 
  Box, 
  LayoutDashboard, 
  Package, 
  Tag, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  RotateCcw, 
  ArrowLeftRight, 
  FileText, 
  Users, 
  UserCog, 
  Shield, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MENU_SECTIONS = [
  {
    title: 'MAIN',
    items: [{ title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }]
  },
  {
    title: 'INVENTORY',
    items: [
      { title: 'Products', icon: Package, path: '/products' },
      { title: 'Categories', icon: Tag, path: '/categories' },
      { title: 'Suppliers', icon: Truck, path: '/suppliers' },
      { title: 'Purchases', icon: ShoppingCart, path: '/purchases' },
      { title: 'Sales', icon: TrendingUp, path: '/sales' },
      { title: 'Sales Return', icon: RotateCcw, path: '/sale-returns' }
    ]
  },
  {
    title: 'ACCOUNTING',
    items: [{ title: 'Balance Transfer', icon: ArrowLeftRight, path: '/balance-transfers' }]
  },
  {
    title: 'OTHERS',
    items: [
      { title: 'Quotations', icon: FileText, path: '/quotations' },
      { title: 'Customers', icon: Users, path: '/customers' }
    ]
  },
  {
    title: 'ADMIN',
    items: [
      { title: 'Users', icon: UserCog, path: '/users' },
      { title: 'Roles & Access', icon: Shield, path: '/roles' },
      { title: 'Setup', icon: Settings, path: '/setup' }
    ]
  }
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-[#1e3a5f] border-r border-light-border dark:border-none transition-all duration-300 ease-in-out md:relative ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-center border-b border-light-border dark:border-[#2d4b73] px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-white dark:bg-white dark:text-primary-900">
              <Box className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none tracking-tight text-primary-900 dark:text-white">IMS</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-300">Inventory System</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {MENU_SECTIONS.map((section, index) => (
            <div key={index} className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#8ea4c8]">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1 px-3">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <li key={itemIndex}>
                      <NavLink
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive 
                              ? 'bg-primary-50 text-primary-900 dark:bg-[#2d4b73] dark:text-white border-l-4 border-primary-600 dark:border-blue-400' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-[#254268] dark:hover:text-white border-l-4 border-transparent'
                          }`
                        }
                        title={collapsed ? item.title : undefined}
                      >
                        <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 shrink-0`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Collapse Toggle */}
        <div className="border-t border-light-border dark:border-[#2d4b73] p-4 hidden md:block">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#254268] dark:hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </>
  );
}