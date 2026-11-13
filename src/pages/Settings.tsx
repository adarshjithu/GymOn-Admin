import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sliders,
  Clock,
  Search,
  Save,
  Check,
  Upload,
} from 'lucide-react';
import type { GeneralSettings, ActivityLogItem } from '../types';
import { adminApi } from '../api/adminApi';

interface SettingsProps {
  initialTab?: 'general' | 'activity-log';
}

export default function Settings({ initialTab = 'general' }: SettingsProps) {
  const { subTab } = useParams<{ subTab?: string }>();
  const navigate = useNavigate();

  const activeTab: 'general' | 'activity-log' =
    subTab === 'activity-log' ? 'activity-log' : initialTab;
  const [settings, setSettings] = useState<GeneralSettings>({
    platformName: 'GYM ON',
    supportEmail: 'support@gymon.in',
    supportWhatsApp: '+91 98765 43210',
    privacyPolicyUrl: 'https://gymon.in/privacy-policy',
    termsConditionsUrl: 'https://gymon.in/terms-conditions',
  });

  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [searchLog, setSearchLog] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const s = await adminApi.getGeneralSettings();
      const l = await adminApi.getActivityLogs();
      if (s) setSettings(s);
      setLogs(Array.isArray(l) ? l : []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.updateGeneralSettings(settings);
      adminApi.addActivityLog('Updated Settings', 'Updated platform configuration');
      setFeedback('Platform settings updated successfully.');
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save');
    }
  };

  const filteredLogs = (logs || []).filter((log) => {
    const q = searchLog.toLowerCase();
    const matchesSearch =
      q === '' ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.admin.toLowerCase().includes(q);

    const matchesAction =
      actionFilter === 'All' || log.action.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-5">
      {/* Top Header & Spec Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {activeTab === 'general' ? 'SA-010 Settings (General)' : 'SA-010b Activity Log'}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Settings & System
          </h1>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => navigate('/settings/general')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'general'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-[#00A389]" />
            <span>General</span>
          </button>
          <button
            onClick={() => navigate('/settings/activity-log')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'activity-log'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-[#00A389]" />
            <span>Activity Log</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: GENERAL SETTINGS (SA-010)                        */}
      {/* ======================================================== */}
      {activeTab === 'general' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs max-w-2xl">
          <h3 className="text-sm font-black text-slate-900 tracking-tight mb-6 pb-3 border-b border-slate-100">
            General Settings
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            {/* Platform Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00A389] focus:bg-white"
              />
            </div>

            {/* Support Email */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00A389] focus:bg-white"
              />
            </div>

            {/* Support WhatsApp */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Support WhatsApp
              </label>
              <input
                type="text"
                value={settings.supportWhatsApp}
                onChange={(e) => setSettings({ ...settings, supportWhatsApp: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00A389] focus:bg-white"
              />
            </div>

            {/* Privacy Policy URL */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Privacy Policy URL
              </label>
              <input
                type="url"
                value={settings.privacyPolicyUrl}
                onChange={(e) => setSettings({ ...settings, privacyPolicyUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00A389] focus:bg-white"
              />
            </div>

            {/* Terms & Conditions URL */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Terms & Conditions URL
              </label>
              <input
                type="url"
                value={settings.termsConditionsUrl}
                onChange={(e) => setSettings({ ...settings, termsConditionsUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00A389] focus:bg-white"
              />
            </div>

            {/* Logo Upload row */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Platform Logo
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="logo-file"
                  className="hidden"
                  onChange={() => alert('Logo file selected.')}
                />
                <label
                  htmlFor="logo-file"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center space-x-1.5"
                >
                  <Upload className="h-3.5 w-3.5 text-slate-400" />
                  <span>Choose File</span>
                </label>
                <span className="text-xs text-slate-400">No file chosen</span>

                {/* Logo Preview */}
                <div className="ml-auto h-9 px-3 rounded-lg bg-[#060D25] text-white flex items-center space-x-1">
                  <span className="text-xs font-black">GYM</span>
                  <span className="text-xs font-black text-[#00C49F]">ON</span>
                </div>
              </div>
            </div>

            {/* Save Changes button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#00A389] hover:bg-[#008f77] text-white shadow-md shadow-[#00A389]/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACTIVITY LOG (SA-010b)                           */}
      {/* ======================================================== */}
      {activeTab === 'activity-log' && (
        <div className="space-y-4">
          {/* Search & Action Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-none sm:max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Search activity..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
              <span>Filter:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389]"
              >
                <option value="All">All Actions</option>
                <option value="Approved">Approved</option>
                <option value="Added">Added</option>
                <option value="Suspended">Suspended</option>
                <option value="Edited">Edited</option>
              </select>
            </div>
          </div>

          {/* Activity Log Table (SA-010b) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Date & Time</th>
                    <th className="py-3.5 px-4">Admin</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 text-slate-500 font-medium">{log.dateTime}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{log.admin}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#00A389] border border-teal-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-700">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing 1 to {filteredLogs.length} of 156 logs
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="px-2.5 py-1 bg-[#00A389] text-white rounded font-bold text-xs">
                  1
                </span>
                <span className="px-2.5 py-1 border border-slate-200 text-slate-600 rounded font-bold text-xs">
                  2
                </span>
                <span className="px-2.5 py-1 border border-slate-200 text-slate-600 rounded font-bold text-xs">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
