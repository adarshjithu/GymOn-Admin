import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Plus,
  Check,
  CheckCircle2,
  ArrowLeft,
  X,
  Dumbbell,
  Filter,
  Calendar,
  Ban,
} from 'lucide-react';
import type { ProviderItem, GymItem } from '../types';
import { adminApi } from '../api/adminApi';

export default function GymProviders() {
  const { providerId } = useParams<{ providerId?: string }>();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // New Provider modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGst, setNewGst] = useState('');

  const loadData = async () => {
    try {
      const pRes = await adminApi.getProviders();
      const gRes = await adminApi.getGyms();
      const pList = Array.isArray(pRes?.providers) ? pRes.providers : Array.isArray(pRes) ? pRes : [];
      const gList = Array.isArray(gRes?.gyms) ? gRes.gyms : Array.isArray(gRes) ? gRes : [];
      setProviders(pList);
      setGyms(gList);

      if (providerId) {
        const found = pList.find((p) => p.id === providerId || p._id === providerId);
        if (found) setSelectedProvider(found);
      }
    } catch (err) {
      console.error(err);
      setProviders([]);
      setGyms([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [providerId]);

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await adminApi.createProvider({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
      });
      if (newBusinessName.trim() || newGst.trim()) {
        await adminApi.updateProvider(created.id, {
          businessName: newBusinessName.trim(),
          gstNumber: newGst.trim(),
        });
      }
      adminApi.addActivityLog('Created Provider', `Registered provider ${created.name}`);
      setFeedbackBanner(`Provider "${created.name}" created successfully.`);
      setIsAddModalOpen(false);
      setNewName('');
      setNewBusinessName('');
      setNewEmail('');
      setNewPhone('');
      setNewGst('');
      loadData();
      setTimeout(() => setFeedbackBanner(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to create provider');
    }
  };

  const formatJoinedDate = (dateVal?: string | Date) => {
    if (!dateVal) return '12 Jul 2025';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  const isProviderBlocked = (provider: ProviderItem) => {
    return provider.isActive === false || provider.status === 'Suspended' || provider.status === 'Blocked';
  };

  const handleBlock = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to block provider "${name}"? They will lose access to provider services.`)) return;
    try {
      const updated = await adminApi.blockProvider(id);
      adminApi.addActivityLog('Blocked Provider', `Blocked provider ${name}`);
      setSelectedProvider((prev) =>
        prev?.id === id || prev?._id === id
          ? { ...prev, ...updated, isActive: false, status: 'Blocked' }
          : prev
      );
      setFeedbackBanner(`Provider "${name}" has been blocked.`);
      loadData();
      setTimeout(() => setFeedbackBanner(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to block provider');
    }
  };

  const handleUnblock = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to unblock provider "${name}"?`)) return;
    try {
      const updated = await adminApi.unblockProvider(id);
      adminApi.addActivityLog('Unblocked Provider', `Unblocked provider ${name}`);
      setSelectedProvider((prev) =>
        prev?.id === id || prev?._id === id
          ? { ...prev, ...updated, isActive: true, status: 'Active' }
          : prev
      );
      setFeedbackBanner(`Provider "${name}" has been unblocked.`);
      loadData();
      setTimeout(() => setFeedbackBanner(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to unblock provider');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const updated = await adminApi.approveProvider(id);
      adminApi.addActivityLog('Approved Provider', `Approved ${updated.name}`);
      setSelectedProvider(updated);
      setFeedbackBanner(`Provider "${updated.name}" has been approved.`);
      loadData();
      setTimeout(() => setFeedbackBanner(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to approve provider');
    }
  };

  const filteredProviders = (providers || []).filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.businessName && p.businessName.toLowerCase().includes(q));

    const isBlocked = isProviderBlocked(p);
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && !isBlocked) ||
      (statusFilter === 'Blocked' && isBlocked);

    return matchSearch && matchStatus;
  });

  const getProviderGyms = (providerName: string, providerId?: string) => {
    return (gyms || []).filter(
      (g) => g.providerName === providerName || (providerId && g.providerId === providerId)
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{feedbackBanner}</span>
          </div>
          <button onClick={() => setFeedbackBanner(null)} className="text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PROVIDERS LIST VIEW (/providers)                      */}
      {/* ========================================================= */}
      {!providerId && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Partners & Facility Owners
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Gym Providers
              </h1>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00A389] hover:bg-[#008f77] shadow-sm flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Provider</span>
            </button>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-[#00A389] flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">Total Providers</div>
                <div className="text-xl font-black text-slate-900">{providers.length}</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">Active Partners</div>
                <div className="text-xl font-black text-slate-900">
                  {providers.filter((p) => !isProviderBlocked(p)).length}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">Total Registered Gyms</div>
                <div className="text-xl font-black text-slate-900">{gyms.length}</div>
              </div>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search provider by name, business, phone or email..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00A389]"
              >
                <option value="All">All Providers</option>
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>

          {/* Providers Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Provider Name</th>
                    <th className="py-3.5 px-4">Business / Contact</th>
                    <th className="py-3.5 px-4 text-center">Gyms</th>
                    <th className="py-3.5 px-4">Joined At</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProviders.map((provider) => {
                    const pGyms = getProviderGyms(provider.name, provider.id);
                    const pendingGyms = pGyms.filter(
                      (g) => g.status === 'Pending Review' || g.status === 'PENDING_APPROVAL'
                    );
                    const isBlocked = isProviderBlocked(provider);

                    return (
                      <tr key={provider.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name */}
                        <td className="py-4 px-6 font-semibold text-slate-800">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 text-[#00A389] font-bold text-xs flex items-center justify-center shrink-0">
                              {provider.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {provider.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-normal">
                                {provider.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Business & Email */}
                        <td className="py-4 px-4 text-slate-600">
                          <div className="font-semibold text-slate-800">
                            {provider.businessName || `${provider.name} Fitness`}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {provider.email}
                          </div>
                        </td>

                        {/* Gyms Count */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center space-x-1.5">
                            <span className="font-black text-slate-800 text-sm">
                              {pGyms.length || provider.gymsCount || 0}
                            </span>
                            {pendingGyms.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                {pendingGyms.length} Pending
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Joined At */}
                        <td className="py-4 px-4 text-slate-600">
                          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{formatJoinedDate(provider.createdAt || provider.registeredOn)}</span>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-4 px-4">
                          {isBlocked ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                              <span>Blocked</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              <span>Active</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/providers/${provider.id}`)}
                              className="font-bold text-[#00A389] hover:underline cursor-pointer px-2 py-1 text-xs"
                            >
                              View Details
                            </button>
                            {isBlocked ? (
                              <button
                                onClick={() => handleUnblock(provider.id, provider.name)}
                                className="font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlock(provider.id, provider.name)}
                                className="font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs"
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PROVIDER DETAILS VIEW (/providers/:providerId)        */}
      {/* ========================================================= */}
      {providerId && selectedProvider && (
        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/providers')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-[#00A389] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Gym Providers</span>
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
                  <span className="text-slate-400 block font-medium">Joined At</span>
                  <span className="font-bold text-slate-800">
                    {formatJoinedDate(selectedProvider.createdAt || selectedProvider.registeredOn)}
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
                  {isProviderBlocked(selectedProvider) ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-300">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      <span>Blocked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Last Active: {selectedProvider.lastLogin || 'Today'}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-6">
                {isProviderBlocked(selectedProvider) ? (
                  <button
                    onClick={() => handleUnblock(selectedProvider.id, selectedProvider.name)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Unblock Provider</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBlock(selectedProvider.id, selectedProvider.name)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Ban className="h-4 w-4" />
                    <span>Block Provider</span>
                  </button>
                )}
                <button
                  onClick={() => alert(`Direct communication channel opened for ${selectedProvider.name}`)}
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
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase">
                    <th className="py-2.5">Gym Name</th>
                    <th className="py-2.5">City</th>
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
                        <td className="py-3 text-slate-600">{gym.city}</td>
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
                            onClick={() => navigate(`/gyms/${gym.id}`)}
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

      {/* ADD PROVIDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Register New Gym Provider
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="e.g. Iron Fitness Group"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. alex@ironfitness.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  value={newGst}
                  onChange={(e) => setNewGst(e.target.value)}
                  placeholder="32ABCDE1234F1Z5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A389] hover:bg-[#008f77] shadow-xs cursor-pointer"
                >
                  Save Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
