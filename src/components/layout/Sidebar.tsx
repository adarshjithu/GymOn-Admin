import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Users,
  Database,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Dumbbell,
  MapPin,
  Sparkles,
  Layers,
  Activity,
  X,
} from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean; // desktop expanded / collapsed
  isMobileOpen: boolean; // mobile drawer open / closed
  onCloseMobile: () => void;
  pendingApprovalsCount?: number;
  onLogout: () => void;
}

export default function Sidebar({
  isSidebarOpen,
  isMobileOpen,
  onCloseMobile,
  pendingApprovalsCount = 0,
  onLogout,
}: SidebarProps) {
  const { isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isMasterDataActive = location.pathname.startsWith('/master-data');
  const [masterDataOpen, setMasterDataOpen] = useState(isMasterDataActive);

  useEffect(() => {
    if (isMasterDataActive) setMasterDataOpen(true);
  }, [location.pathname, isMasterDataActive]);

  const isProvidersActive = location.pathname.startsWith('/providers');
  const isGymsActive = location.pathname.startsWith('/gyms');

  const handleNavClick = () => {
    onCloseMobile();
  };

  return (
    <aside
      className={`bg-[#060D25] text-white flex flex-col transition-all duration-300 select-none border-r border-slate-800 shadow-xl
        fixed inset-y-0 left-0 z-50 w-72 md:static md:translate-x-0 shrink-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}
      `}
    >
      {/* Brand Logo Header */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-slate-800/80">
        <div
          onClick={() => {
            navigate('/dashboard');
            handleNavClick();
          }}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#00A389] to-[#00C49F] flex items-center justify-center shadow-md shadow-[#00C49F]/20 shrink-0">
            <Dumbbell className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          {(isSidebarOpen || isMobileOpen) && (
            <div className="flex items-center space-x-1">
              <span className="text-xl font-black tracking-wide text-white">GYM</span>
              <span className="text-xl font-black tracking-wide text-[#00C49F]">ON</span>
            </div>
          )}
        </div>

        {/* Close Button on Mobile Drawer */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Close Navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* 1. Dashboard */}
        <NavLink
          to="/dashboard"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-[#00A389] text-white shadow-md shadow-[#00A389]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`
          }
          title="Dashboard"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {(isSidebarOpen || isMobileOpen) && <span className="truncate">Dashboard</span>}
        </NavLink>

        {/* 2. Gym Providers (SEPARATE) */}
        <NavLink
          to="/providers"
          onClick={handleNavClick}
          className={() =>
            `w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isProvidersActive
                ? 'bg-[#00A389] text-white shadow-md shadow-[#00A389]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`
          }
          title="Gym Providers"
        >
          <Building2 className="h-4 w-4 shrink-0" />
          {(isSidebarOpen || isMobileOpen) && <span className="truncate">Gym Providers</span>}
        </NavLink>

        {/* 3. Gyms (SEPARATE WITH PENDING BADGE) */}
        <NavLink
          to="/gyms"
          onClick={handleNavClick}
          className={() =>
            `w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
              isGymsActive
                ? 'bg-[#00A389] text-white shadow-md shadow-[#00A389]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`
          }
          title="Gyms"
        >
          <Dumbbell className="h-4 w-4 shrink-0" />
          {(isSidebarOpen || isMobileOpen) ? (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="truncate">Gyms</span>
              {pendingApprovalsCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  {pendingApprovalsCount}
                </span>
              )}
            </div>
          ) : (
            pendingApprovalsCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
            )
          )}
        </NavLink>

        {/* 4. Customer Leads */}
        <NavLink
          to="/leads"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-[#00A389] text-white shadow-md shadow-[#00A389]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`
          }
          title="Customer Leads"
        >
          <UserPlus className="h-4 w-4 shrink-0" />
          {(isSidebarOpen || isMobileOpen) && <span className="truncate">Customer Leads</span>}
        </NavLink>

        {/* 5. Customers */}
        <NavLink
          to="/customers"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-[#00A389] text-white shadow-md shadow-[#00A389]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`
          }
          title="Customers"
        >
          <Users className="h-4 w-4 shrink-0" />
          {(isSidebarOpen || isMobileOpen) && <span className="truncate">Customers</span>}
        </NavLink>

        {/* 6. Master Data (Expandable accordion) */}
        <div>
          <button
            onClick={() => {
              setMasterDataOpen(!masterDataOpen);
              if (!masterDataOpen && !isMasterDataActive) {
                navigate('/master-data/cities');
              }
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isMasterDataActive
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Master Data"
          >
            <div className="flex items-center space-x-3.5">
              <Database className="h-4 w-4 shrink-0 text-[#00C49F]" />
              {(isSidebarOpen || isMobileOpen) && <span>Master Data</span>}
            </div>
            {(isSidebarOpen || isMobileOpen) && (
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                  masterDataOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {(isSidebarOpen || isMobileOpen) && masterDataOpen && (
            <div className="pl-8 pr-2 py-1 space-y-1">
              <NavLink
                to="/master-data/cities"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#00C49F] font-bold bg-[#00A389]/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <MapPin className="h-3 w-3 shrink-0" />
                <span>Cities</span>
              </NavLink>
              <NavLink
                to="/master-data/facilities"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#00C49F] font-bold bg-[#00A389]/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Sparkles className="h-3 w-3 shrink-0" />
                <span>Facilities</span>
              </NavLink>
              <NavLink
                to="/master-data/gym-types"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#00C49F] font-bold bg-[#00A389]/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Layers className="h-3 w-3 shrink-0" />
                <span>Gym Types</span>
              </NavLink>
              <NavLink
                to="/master-data/crowd-levels"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#00C49F] font-bold bg-[#00A389]/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Activity className="h-3 w-3 shrink-0" />
                <span>Crowd Levels</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* 7. Admin Users (Only visible to Super Admin) */}
        {isSuperAdmin && (
          <NavLink
            to="/admins"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#00A389] text-white shadow-md shadow-[#00A389]/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`
            }
            title="Admin Users"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {(isSidebarOpen || isMobileOpen) && <span className="truncate">Admin Users</span>}
          </NavLink>
        )}

        {/* 8. Logout */}
        <div className="pt-4 mt-4 border-t border-slate-800/80">
          <button
            onClick={() => {
              onLogout();
              handleNavClick();
            }}
            className="w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(isSidebarOpen || isMobileOpen) && <span className="truncate">Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
