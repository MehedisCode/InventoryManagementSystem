import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Sun, Moon, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Header({ setMobileOpen }) {
  const { toggleTheme, isDark } = useThemeStore();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const formatTitle = (path) => {
    const route = path.split('/')[1];
    if (!route) return 'Dashboard';
    return route.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-light-border bg-white px-4 shadow-sm dark:border-dark-border dark:bg-dark-card md:px-6">
      <div className="flex items-center gap-4">
        <button 
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white hidden sm:block">
          {formatTitle(location.pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <button 
          onClick={toggleTheme}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-light-border p-1 pr-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-white">
              <UserIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">
              {user?.name || 'Admin'}
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-card dark:ring-slate-700 z-50">
                <div className="border-b border-light-border px-4 py-3 dark:border-dark-border">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'Admin User'}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email || 'admin@ims.com'}</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}