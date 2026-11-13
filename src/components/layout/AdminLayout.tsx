import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { adminApi } from '../../api/adminApi';

interface AdminLayoutProps {
  onLogout: () => void;
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [selectedDate] = useState('15 Jul 2025');

  const refreshPendingCount = async () => {
    try {
      const stats = await adminApi.getDashboardStats();
      setPendingApprovalsCount(stats.gyms?.pending ?? stats.pendingApprovals ?? 0);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshPendingCount();
  }, []);

  const handleToggleSidebar = () => {
    // If on mobile screen (< 768px), toggle mobile drawer
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased overflow-hidden text-slate-800 relative">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Responsive Sidebar Navigation */}
      <Sidebar
        isSidebarOpen={isDesktopSidebarOpen}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        pendingApprovalsCount={pendingApprovalsCount}
        onLogout={onLogout}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dynamic Header */}
        <Header
          selectedDate={selectedDate}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Dynamic Route Pages Rendered by React Router */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 bg-[#F8FAFC] overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ refreshPendingCount }} />
          </div>
        </main>
      </div>
    </div>
  );
}
