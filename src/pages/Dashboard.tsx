import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Dumbbell,
  UserPlus,
  Clock,
  ArrowUpRight,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { GymItem } from '../types';
export default function Dashboard() {
  const navigate = useNavigate();
  const [pendingGyms, setPendingGyms] = useState<GymItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await adminApi.getGyms();
      const gymList = Array.isArray(res?.gyms) ? res.gyms : Array.isArray(res) ? res : [];
      const pend = gymList.filter(
        (g) => g.status === 'Pending Review' || g.status === 'PENDING_APPROVAL'
      );
      setPendingGyms(pend);
    } catch (err) {
      console.error(err);
      setPendingGyms([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Spec Tag */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            SA-002 Dashboard
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Good Morning, Admin 👋
          </p>
        </div>
        <div className="hidden sm:block text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs shrink-0">
          Today: 15 Jul 2025
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 STAT METRIC CARDS (SA-002) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Providers */}
        <div
          onClick={() => navigate('/providers')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-[#00A389] hover:shadow-sm transition-all"
        >
          <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-100 text-[#00A389] flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Total Providers</div>
            <div className="text-2xl font-black text-slate-900 leading-tight">125</div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-0.5 mt-0.5">
              <span>+6 this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Gyms */}
        <div
          onClick={() => navigate('/gyms')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-[#00A389] hover:shadow-sm transition-all"
        >
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Dumbbell className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Total Gyms</div>
            <div className="text-2xl font-black text-slate-900 leading-tight">210</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              195 Live • 15 Draft
            </div>
          </div>
        </div>

        {/* Card 3: Today's Leads */}
        <div
          onClick={() => navigate('/leads')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-[#00A389] hover:shadow-sm transition-all"
        >
          <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <UserPlus className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Today's Leads</div>
            <div className="text-2xl font-black text-slate-900 leading-tight">42</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              +12 vs yesterday
            </div>
          </div>
        </div>

        {/* Card 4: Pending Approvals with [Review Now] button */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">Pending Approvals</div>
                <div className="text-2xl font-black text-slate-900 leading-tight">
                  {pendingGyms.length > 0 ? pendingGyms.length : 8}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (pendingGyms.length > 0) {
                navigate(`/gyms/${pendingGyms[0]!.id}`);
              } else {
                navigate('/gyms');
              }
            }}
            className="mt-3 w-full bg-[#00A389] hover:bg-[#008f77] text-white text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>Review Now</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* TWO COLUMN TABLES: RECENT PROVIDERS & RECENT CUSTOMER LEADS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Provider Registrations */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 tracking-tight">
              Recent Provider Registrations
            </h3>
            <button
              onClick={() => navigate('/gyms')}
              className="text-xs font-bold text-[#00A389] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Row 1 */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  FN
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Fit Nation</div>
                  <div className="text-[10px] text-slate-400">Today, 11:30 AM</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending
                </span>
                <button
                  onClick={() => {
                    if (pendingGyms.length > 0) {
                      navigate(`/gyms/${pendingGyms[0]!.id}`);
                    } else {
                      navigate('/gyms');
                    }
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#00A389] border border-[#00A389] rounded-lg hover:bg-[#00A389] hover:text-white transition-colors cursor-pointer"
                >
                  Review
                </button>
              </div>
            </div>

            {/* Row 2 */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  PG
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Power Gym</div>
                  <div className="text-[10px] text-slate-400">Yesterday, 04:15 PM</div>
                </div>
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Approved
                </span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  AF
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">ABC Fitness</div>
                  <div className="text-[10px] text-slate-400">Yesterday, 02:45 PM</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending
                </span>
                <button
                  onClick={() => navigate('/gyms')}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#00A389] border border-[#00A389] rounded-lg hover:bg-[#00A389] hover:text-white transition-colors cursor-pointer"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Customer Leads */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 tracking-tight">
              Recent Customer Leads
            </h3>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs font-bold text-[#00A389] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Lead 1 */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  JM
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">John Mathew</div>
                  <div className="text-[10px] text-slate-400">Iron Fitness</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[11px] text-slate-500 font-medium">6:00 PM</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  New
                </span>
              </div>
            </div>

            {/* Lead 2 */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  RA
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Rahul</div>
                  <div className="text-[10px] text-slate-400">Power Fitness</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[11px] text-slate-500 font-medium">7:00 PM</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Viewed
                </span>
              </div>
            </div>

            {/* Lead 3 */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  AN
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Anand</div>
                  <div className="text-[10px] text-slate-400">Gold Gym</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[11px] text-slate-500 font-medium">5:30 PM</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  New
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION (SA-002) */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Action 1: Review Pending Gyms */}
          <button
            onClick={() => {
              if (pendingGyms.length > 0) {
                navigate(`/gyms/${pendingGyms[0]!.id}`);
              } else {
                navigate('/gyms');
              }
            }}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#00A389] hover:shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-teal-50 text-[#00A389] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold text-slate-800 group-hover:text-[#00A389] transition-colors">
              Review Pending Gyms
            </div>
          </button>

          {/* Action 2: Add City */}
          <button
            onClick={() => navigate('/master-data/cities')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#00A389] hover:shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold text-slate-800 group-hover:text-[#00A389] transition-colors">
              Add City
            </div>
          </button>

          {/* Action 3: Manage Facilities */}
          <button
            onClick={() => navigate('/master-data/facilities')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#00A389] hover:shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold text-slate-800 group-hover:text-[#00A389] transition-colors">
              Manage Facilities
            </div>
          </button>

          {/* Action 4: View All Leads */}
          <button
            onClick={() => navigate('/leads')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#00A389] hover:shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold text-slate-800 group-hover:text-[#00A389] transition-colors">
              View All Leads
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
