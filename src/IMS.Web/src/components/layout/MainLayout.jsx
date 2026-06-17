import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import PageWrapper from './PageWrapper';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-light-bg text-slate-900 dark:bg-dark-bg dark:text-slate-100 font-sans">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header setMobileOpen={setMobileOpen} />
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </div>
    </div>
  );
};
export default MainLayout;