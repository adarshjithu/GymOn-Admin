import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  CheckCircle2,
  ArrowLeft,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';
import type { ProviderItem, GymItem } from '../types';
import { adminApi } from '../api/adminApi';

interface ProvidersAndGymsProps {
  initialGymId?: string | null;
  onGymApproved?: () => void;
}

export default function ProvidersAndGyms({ initialGymId, onGymApproved }: ProvidersAndGymsProps) {
  const { gymId: paramGymId, providerId: paramProviderId } = useParams<{
    gymId?: string;
    providerId?: string;
  }>();
  const navigate = useNavigate();
  const outletCtx = useOutletContext<{ refreshPendingCount?: () => void }>() || {};

  const activeGymId = paramGymId || initialGymId;

  // Navigation state: 'list' | 'provider-detail' | 'gym-detail'
  const [viewMode, setViewMode] = useState<'list' | 'provider-detail' | 'gym-detail'>(
    activeGymId ? 'gym-detail' : paramProviderId ? 'provider-detail' : 'list'
  );
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [selectedGym, setSelectedGym] = useState<GymItem | null>(null);

  // Data state
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({
    'prov-001': true,
    'prov-002': true,
    'prov-003': true,
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [providerStatusFilter, setProviderStatusFilter] = useState('All');
  const [gymStatusFilter, setGymStatusFilter] = useState('All');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const pRes = await adminApi.getProviders();
      const gRes = await adminApi.getGyms();
      const provList = Array.isArray(pRes?.providers) ? pRes.providers : Array.isArray(pRes) ? pRes : [];
      const gymList = Array.isArray(gRes?.gyms) ? gRes.gyms : Array.isArray(gRes) ? gRes : [];
      setProviders(provList);
      setGyms(gymList);

      if (activeGymId) {
        const found = gymList.find((g) => g.id === activeGymId || g._id === activeGymId || g.slug === activeGymId);
        if (found) {
          setSelectedGym(found);
          const matchedProv = provList.find((p) => p.name === found.providerName || p.id === found.providerId);
          if (matchedProv) setSelectedProvider(matchedProv);
          setViewMode('gym-detail');
        }
      } else if (paramProviderId) {
        const found = provList.find((p) => p.id === paramProviderId || p._id === paramProviderId);
        if (found) {
          setSelectedProvider(found);
          setViewMode('provider-detail');
        }
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Failed to load providers and gyms', err);
      setProviders([]);
      setGyms([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeGymId, paramProviderId]);

  const toggleExpand = (providerId: string) => {
    setExpandedProviders((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  const handleViewProvider = (provider: ProviderItem) => {
    setSelectedProvider(provider);
    navigate(`/providers/${provider.id}`);
  };

  const handleViewGym = (gym: GymItem, provider?: ProviderItem) => {
    setSelectedGym(gym);
    if (provider) {
      setSelectedProvider(provider);
    }
    navigate(`/gyms/${gym.id}`);
  };

  const handleApproveGym = async (gymId: string) => {
    try {
      const updated = await adminApi.approveGym(gymId);
      adminApi.addActivityLog('Approved Gym', `Approved ${updated.gymName}`);
      setSelectedGym(updated);
      setFeedback(`Gym "${updated.gymName}" has been successfully approved and is now LIVE!`);
      loadData();
      outletCtx.refreshPendingCount?.();
      if (onGymApproved) onGymApproved();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to approve gym');
    }
  };

  const handleDeactivateGym = async (gymId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this gym?')) return;
    try {
      const updated = await adminApi.updateGymStatus(gymId, 'Deactivated', false);
      adminApi.addActivityLog('Deactivated Gym', `Deactivated ${updated.gymName}`);
      setSelectedGym(updated);
      setFeedback(`Gym "${updated.gymName}" has been deactivated.`);
      loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to deactivate gym');
    }
  };

  const handleSuspendProvider = async (providerId: string) => {
    try {
      const updated = await adminApi.suspendProvider(providerId);
      adminApi.addActivityLog('Suspended Provider', `Suspended ${updated.name}`);
      setSelectedProvider(updated);
      setFeedback(`Provider "${updated.name}" has been suspended.`);
      loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to suspend provider');
    }
  };

  const handleReactivateProvider = async (providerId: string) => {
    try {
      const updated = await adminApi.reactivateProvider(providerId);
      adminApi.addActivityLog('Reactivated Provider', `Reactivated ${updated.name}`);
      setSelectedProvider(updated);
      setFeedback(`Provider "${updated.name}" has been reactivated.`);
      loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to reactivate provider');
    }
  };

  const handleApproveProvider = async (providerId: string) => {
    try {
      const updated = await adminApi.approveProvider(providerId);
      adminApi.addActivityLog('Approved Provider', `Approved ${updated.name}`);
      setSelectedProvider(updated);
      setFeedback(`Provider "${updated.name}" has been approved.`);
      loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to approve provider');
    }
  };

  // Filter providers and gyms
  const filteredProviders = (providers || []).filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const matchesStatus =
      providerStatusFilter === 'All' || p.status === providerStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get gyms belonging to a provider
  const getProviderGyms = (providerName: string, providerId?: string) => {
    return (gyms || []).filter((g) => {
      const matchesProvider =
        g.providerName === providerName || (providerId && g.providerId === providerId);
      if (!matchesProvider) return false;

      if (gymStatusFilter !== 'All') {
        const norm = g.status === 'APPROVED' ? 'Live' : g.status === 'PENDING_APPROVAL' ? 'Pending Review' : g.status;
        return norm.toLowerCase() === gymStatusFilter.toLowerCase();
      }
      return true;
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: SA-003 PROVIDERS & GYMS (HIERARCHICAL TABLE)      */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-5">
          {/* Header & Spec tag */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                SA-003 Providers & Gyms
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Providers & Gyms
              </h1>
            </div>
          </div>

          {/* Search & Filters Bar matching SA-003 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-[220px] relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search provider or gym..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
              />
            </div>

            {/* Provider Status Filter */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
              <span>Provider Status:</span>
              <select
                value={providerStatusFilter}
                onChange={(e) => setProviderStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00A389]"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Gym Status Filter */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
              <span>Gym Status:</span>
              <select
                value={gymStatusFilter}
                onChange={(e) => setGymStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00A389]"
              >
                <option value="All">All</option>
                <option value="Live">Live</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Draft">Draft</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setProviderStatusFilter('All');
                setGymStatusFilter('All');
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Hierarchical Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Provider / Gym</th>
                    <th className="py-3 px-4">Provider Status</th>
                    <th className="py-3 px-4 text-center">Gyms</th>
                    <th className="py-3 px-4">Gym Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProviders.map((provider) => {
                    const providerGyms = getProviderGyms(provider.name, provider.id);
                    const isExpanded = expandedProviders[provider.id] ?? true;

                    return (
                      <tbody key={provider.id} className="border-b border-slate-200/60 last:border-b-0">
                        {/* PROVIDER ROW */}
                        <tr className="bg-slate-50/40 hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-6 font-semibold text-slate-800">
                            <div className="flex items-center space-x-2.5">
                              <button
                                onClick={() => toggleExpand(provider.id)}
                                className="p-1 rounded hover:bg-slate-200/60 text-slate-500 cursor-pointer"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <div>
                                <div className="font-bold text-slate-900">{provider.name}</div>
                                <div className="text-[11px] text-slate-400 font-normal">
                                  {provider.phone}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Provider Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                provider.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : provider.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {provider.status}
                            </span>
                          </td>

                          {/* Gyms Count */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                            {providerGyms.length || provider.gymsCount || 0}
                          </td>

                          {/* Gym Status blank on provider row */}
                          <td className="py-3.5 px-4 text-slate-400">-</td>

                          {/* Provider Actions */}
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleViewProvider(provider)}
                                className="font-bold text-[#00A389] hover:text-[#008f77] cursor-pointer"
                              >
                                View
                              </button>
                              {provider.status === 'Active' ? (
                                <button
                                  onClick={() => handleSuspendProvider(provider.id)}
                                  className="font-medium text-slate-500 hover:text-rose-600 cursor-pointer"
                                >
                                  Suspend
                                </button>
                              ) : provider.status === 'Pending' ? (
                                <button
                                  onClick={() => handleApproveProvider(provider.id)}
                                  className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                >
                                  Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReactivateProvider(provider.id)}
                                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* SUB-ROWS FOR PROVIDER'S GYMS */}
                        {isExpanded &&
                          providerGyms.map((gym) => {
                            const normalizedStatus =
                              gym.status === 'APPROVED'
                                ? 'Live'
                                : gym.status === 'PENDING_APPROVAL'
                                ? 'Pending Review'
                                : gym.status;

                            return (
                              <tr
                                key={gym.id || gym.slug}
                                className="bg-white hover:bg-teal-50/30 transition-colors"
                              >
                                <td className="py-2.5 px-6 pl-14">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-slate-300 font-mono text-xs">└</span>
                                    <span className="font-semibold text-slate-800">
                                      {gym.gymName}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 text-slate-400">-</td>
                                <td className="py-2.5 px-4 text-center text-slate-400">-</td>
                                <td className="py-2.5 px-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                      normalizedStatus === 'Live'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : normalizedStatus === 'Pending Review'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : normalizedStatus === 'Draft'
                                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}
                                  >
                                    {normalizedStatus}
                                  </span>
                                </td>
                                <td className="py-2.5 px-6 text-right">
                                  <button
                                    onClick={() => handleViewGym(gym, provider)}
                                    className="font-bold text-[#00A389] hover:underline cursor-pointer"
                                  >
                                    View Gym
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: SA-004 PROVIDER DETAILS                           */}
      {/* ========================================================= */}
      {viewMode === 'provider-detail' && selectedProvider && (
        <div className="space-y-6">
          {/* Breadcrumb Navigation & Spec Tag */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/gyms')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-[#00A389] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Providers & Gyms</span>
            </button>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SA-004 Provider Details
            </div>
          </div>

          {/* Top Info Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Provider Information */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">
                Provider Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedProvider.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Business Name</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedProvider.businessName || `${selectedProvider.name} Fitness`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile Number</span>
                  <span className="font-bold text-slate-800">{selectedProvider.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">GST Number</span>
                  <span className="font-bold text-slate-800">
                    {selectedProvider.gstNumber || '32ABCDE1234F1Z5'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email</span>
                  <span className="font-bold text-slate-800">{selectedProvider.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Registered On</span>
                  <span className="font-bold text-slate-800">
                    {selectedProvider.registeredOn || '12 Jul 2025, 10:30 AM'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right col: Account Status & Actions */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-3">
                  Account Status
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      selectedProvider.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : selectedProvider.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    {selectedProvider.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Last Active: {selectedProvider.lastLogin || '15 Jul 2025, 09:20 AM'}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-6">
                {selectedProvider.status === 'Active' ? (
                  <button
                    onClick={() => handleSuspendProvider(selectedProvider.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Suspend Provider
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivateProvider(selectedProvider.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Reactivate Provider
                  </button>
                )}
                <button
                  onClick={() => alert(`Message interface opened for ${selectedProvider.name}`)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#00A389] bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Registered Gyms Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">
              Registered Gyms ({getProviderGyms(selectedProvider.name, selectedProvider.id).length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase">
                    <th className="py-2.5">Gym Name</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Submitted On</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {getProviderGyms(selectedProvider.name, selectedProvider.id).map((gym) => {
                    const normStatus =
                      gym.status === 'APPROVED'
                        ? 'Live'
                        : gym.status === 'PENDING_APPROVAL'
                        ? 'Pending Review'
                        : gym.status;

                    return (
                      <tr key={gym.id || gym.slug} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-800">{gym.gymName}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              normStatus === 'Live'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : normStatus === 'Pending Review'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {normStatus}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{gym.submittedOn || '13 Jul 2025'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleViewGym(gym, selectedProvider)}
                            className="font-bold text-[#00A389] hover:underline cursor-pointer"
                          >
                            View Gym
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provider Timeline */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">
              Provider Timeline
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
              <div className="hidden sm:block absolute top-3 left-6 right-6 h-0.5 bg-emerald-200 z-0" />
              {(selectedProvider.timeline || [
                { date: '12 Jul 2025', title: 'Registered' },
                { date: '13 Jul 2025', title: 'Gym Submitted' },
                { date: '14 Jul 2025', title: 'Approved' },
                { date: '15 Jul 2025', title: 'Updated Profile' },
              ]).map((step, idx) => (
                <div key={idx} className="flex sm:flex-col items-center space-x-3 sm:space-x-0 relative z-10">
                  <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                  <div className="text-left sm:text-center mt-2">
                    <div className="text-[10px] text-slate-400 font-semibold">{step.date}</div>
                    <div className="text-xs font-bold text-slate-800">{step.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: SA-005 GYM DETAILS                                */}
      {/* ========================================================= */}
      {viewMode === 'gym-detail' && selectedGym && (
        <div className="space-y-6">
          {/* Breadcrumb Navigation & Spec Tag */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => (selectedProvider ? navigate(`/providers/${selectedProvider.id}`) : navigate('/gyms'))}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-[#00A389] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to {selectedProvider ? 'Provider Details' : 'Providers & Gyms'}</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                SA-005 Gym Details
              </span>
              <button
                onClick={() => alert(`Previewing ${selectedGym.gymName} in public customer view`)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Preview Customer Page
              </button>
              <button
                onClick={() => alert('Gym edit dialog')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Top Gym Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Gym Name & Meta */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedGym.gymName}
                  </h1>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                      selectedGym.status === 'Live' || selectedGym.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : selectedGym.status === 'Pending Review' || selectedGym.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                        : selectedGym.status === 'Draft'
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    {selectedGym.status === 'APPROVED' ? 'Live' : selectedGym.status === 'PENDING_APPROVAL' ? 'Pending Review' : selectedGym.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium space-x-2">
                  <span>Provider: <strong className="text-slate-800">{selectedGym.providerName}</strong></span>
                  <span>•</span>
                  <span>Submitted On: {selectedGym.submittedOn || '13 Jul 2025, 11:20 AM'}</span>
                  {selectedGym.approvedOn && (
                    <>
                      <span>•</span>
                      <span>Approved On: {selectedGym.approvedOn}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Photos Gallery: 3 photos */}
              <div className="flex items-center space-x-3 overflow-x-auto pb-1">
                {(selectedGym.photos && selectedGym.photos.length > 0
                  ? selectedGym.photos
                  : [
                      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
                      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=400&q=80',
                      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
                    ]
                )
                  .slice(0, 3)
                  .map((photo, i) => (
                    <div
                      key={i}
                      className="h-20 w-28 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 group relative cursor-pointer"
                      onClick={() => window.open(photo, '_blank')}
                    >
                      <img
                        src={photo}
                        alt={`Gym photo ${i + 1}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Details 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Gym Information */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-800 tracking-tight border-b border-slate-100 pb-3">
                Gym Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Address</span>
                  <span className="font-bold text-slate-800 text-right max-w-xs">
                    {selectedGym.address}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">City</span>
                  <span className="font-bold text-slate-800">{selectedGym.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Gym Type</span>
                  <span className="font-bold text-slate-800">{selectedGym.gymType || 'Unisex'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Entry Fee</span>
                  <span className="font-black text-[#00A389] text-sm">
                    ₹{selectedGym.dayPassPrice}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Monthly Fee</span>
                  <span className="font-black text-slate-900 text-sm">
                    ₹{selectedGym.monthlyMembershipPrice || 2000}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Opening Hours</span>
                  <span className="font-bold text-slate-800">
                    {typeof selectedGym.openingHours === 'string'
                      ? selectedGym.openingHours
                      : '6:00 AM - 10:00 PM'}
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 font-medium block mb-1">Description</span>
                  <p className="text-slate-600 leading-relaxed font-normal">
                    {selectedGym.description ||
                      'A premium fitness center with world class equipment and certified trainers.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Facilities & Holidays */}
            <div className="space-y-6">
              {/* Facilities */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">
                    Facilities
                  </h3>
                  <span className="text-xs font-bold text-[#00A389] cursor-pointer hover:underline">
                    View All ({selectedGym.facilities?.length || 8})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedGym.facilities && selectedGym.facilities.length > 0
                    ? selectedGym.facilities
                    : ['Parking', 'Locker', 'Shower', 'Air Conditioning', 'Wi-Fi', 'Cardio', 'Personal Trainer', 'Steam Bath']
                  ).map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 flex items-center space-x-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-[#00A389]" />
                      <span>{fac}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Holidays */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">
                  Holidays
                </h3>
                <div className="space-y-2.5 text-xs">
                  {(selectedGym.holidays || [
                    { date: '15 Aug 2025', name: 'Independence Day', isClosed: true },
                    { date: '2 Oct 2025', name: 'Gandhi Jayanti', isClosed: true },
                    { date: '20 Dec 2025', name: 'Gym Anniversary', isClosed: true },
                  ]).map((holiday, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700">{holiday.date}</span>
                        <span className="text-slate-500 font-medium">{holiday.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Closed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar (SA-005 Bottom Bar) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Actions for <strong className="text-slate-800">{selectedGym.gymName}</strong>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {/* Approve Gym Button */}
              {selectedGym.status !== 'Live' && selectedGym.status !== 'APPROVED' ? (
                <button
                  onClick={() => handleApproveGym(selectedGym.id || selectedGym._id || '')}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs bg-[#00A389] hover:bg-[#008f77] text-white shadow-md shadow-[#00A389]/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve Gym</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Gym is Live</span>
                </div>
              )}

              {/* Deactivate Gym Button */}
              <button
                onClick={() => handleDeactivateGym(selectedGym.id || selectedGym._id || '')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Deactivate Gym
              </button>

              {/* More Actions Dropdown */}
              <button
                onClick={() => alert(`Additional actions: Edit SEO tags, Re-assign ownership, Audit logs.`)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                More Actions ▾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
