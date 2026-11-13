import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Calendar, ChevronDown, ShieldCheck, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeTab?: string;
  selectedDate: string;
  onToggleSidebar: () => void;
}

export default function Header({
  activeTab,
  selectedDate,
  onToggleSidebar,
}: HeaderProps) {
  const location = useLocation();
  const { currentAdmin, switchRole } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getTitle = () => {
    if (activeTab) {
      return activeTab.includes(' - ') ? activeTab.split(' - ')[0] : activeTab;
    }
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'Dashboard';
    if (p.startsWith('/providers')) return 'Gym Providers';
    if (p.startsWith('/gyms')) return 'Gyms';
    if (p.startsWith('/leads')) return 'Customer Leads';
    if (p.startsWith('/customers')) return 'Customers';
    if (p.startsWith('/master-data')) return 'Master Data';
    if (p.startsWith('/admins')) return 'Admin Users';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-xs z-20">
      {/* Left: Menu Toggle & Title */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 sm:ml-0 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight truncate">
          {getTitle()}
        </h2>
      </div>

      {/* Right: Date Picker, User Avatar */}
      <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
        {/* Date Picker Badge (hidden on mobile, visible on tablet+) */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>Today: {selectedDate}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* User Profile Badge */}
        <div className="relative">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 sm:space-x-3 pl-1 sm:pl-2 border-l border-slate-200 cursor-pointer select-none group"
            title="Click to view role or switch account mode"
          >
            <div
              className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 transition-transform group-hover:scale-105 ${
                currentAdmin.role === 'Super Admin'
                  ? 'bg-gradient-to-tr from-[#00A389] to-[#00C49F]'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
              }`}
            >
              {currentAdmin.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {currentAdmin.name}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  currentAdmin.role === 'Super Admin' ? 'text-[#00A389]' : 'text-blue-600'
                }`}
              >
                {currentAdmin.role}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block" />
          </div>

          {/* Role Switching / Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-3 space-y-2.5 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 border-b border-slate-100 pb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Logged in as
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {currentAdmin.name} ({currentAdmin.email})
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center space-x-1">
                    {currentAdmin.role === 'Super Admin' ? (
                      <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Super Admin (Full Access)
                      </span>
                    ) : (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Sub Admin (Standard Access)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                  Test Role Mode
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      switchRole('Super Admin');
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      currentAdmin.role === 'Super Admin'
                        ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="h-4 w-4 text-[#00A389]" />
                      <span>Super Admin</span>
                    </div>
                    {currentAdmin.role === 'Super Admin' && <Check className="h-3.5 w-3.5 text-[#00A389]" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('Sub Admin');
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      currentAdmin.role === 'Sub Admin'
                        ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      <span>Sub Admin</span>
                    </div>
                    {currentAdmin.role === 'Sub Admin' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 px-2 leading-tight">
                  {currentAdmin.role === 'Super Admin'
                    ? 'Super Admin can view & manage Admin Users menu and add Sub Admins.'
                    : 'Sub Admin mode: Admin Users menu is hidden and /admins is restricted.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
