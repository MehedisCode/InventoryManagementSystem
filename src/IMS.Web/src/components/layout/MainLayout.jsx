import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageWrapper from "./PageWrapper";
import { useAuth, useMe } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const { data: meData } = useMe(isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (meData?.data) {
      setUser(meData.data);
    }
  }, [meData, setUser]);

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
