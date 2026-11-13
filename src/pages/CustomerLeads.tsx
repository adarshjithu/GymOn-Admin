import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Calendar,
  X,
} from 'lucide-react';
import type { LeadItem } from '../types';
import { adminApi } from '../api/adminApi';

export default function CustomerLeads() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');
  const [gymFilter, setGymFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      const res = await adminApi.getLeads();
      const list = Array.isArray(res?.leads) ? res.leads : Array.isArray(res) ? res : [];
      setLeads(list);
    } catch (err) {
      console.error(err);
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (leadId: string, newStatus: any) => {
    try {
      const updated = await adminApi.updateLeadStatus(leadId, newStatus);
      adminApi.addActivityLog('Updated Lead Status', `Lead for ${updated.customerName} set to ${newStatus}`);
      setFeedback(`Lead status updated to "${newStatus}"!`);
      setSelectedLead(updated);
      fetchLeads();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update lead');
    }
  };

  const filteredLeads = (leads || []).filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      lead.customerName.toLowerCase().includes(q) ||
      lead.customerPhone.includes(q) ||
      lead.gymName.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All' || lead.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesProvider =
      providerFilter === 'All' || lead.providerName === providerFilter;

    const matchesGym = gymFilter === 'All' || lead.gymName === gymFilter;

    return matchesSearch && matchesStatus && matchesProvider && matchesGym;
  });

  return (
    <div className="space-y-5">
      {/* Top Title & Spec Tag */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            SA-006 Customer Leads
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Leads
          </h1>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* TOP FILTERS ROW (SA-006) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
          {/* Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date</label>
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Today (15 Jul 2025)</span>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">City</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389]"
            >
              <option value="All">All Cities</option>
              <option value="Kochi">Kochi</option>
              <option value="Thrissur">Thrissur</option>
              <option value="Calicut">Calicut</option>
              <option value="Trivandrum">Trivandrum</option>
            </select>
          </div>

          {/* Provider */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Provider</label>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389]"
            >
              <option value="All">All Providers</option>
              <option value="ISMAIL">ISMAIL</option>
              <option value="ABC Fitness">ABC Fitness</option>
              <option value="Power Club">Power Club</option>
            </select>
          </div>

          {/* Gym */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gym</label>
            <select
              value={gymFilter}
              onChange={(e) => setGymFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389]"
            >
              <option value="All">All Gyms</option>
              <option value="Iron Fitness">Iron Fitness</option>
              <option value="Power Fitness">Power Fitness</option>
              <option value="Gold Gym">Gold Gym</option>
              <option value="Muscle Factory">Muscle Factory</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389]"
            >
              <option value="All">All</option>
              <option value="New">New</option>
              <option value="Viewed">Viewed</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button
              onClick={() => alert('Exporting customer leads to CSV/Excel...')}
              className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search Input Row */}
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer or mobile..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* CUSTOMER LEADS TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-4">Gym</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Visit Date</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeads.map((lead) => {
                const s = String(lead.status).toUpperCase();
                const normStatus =
                  s === 'NEW'
                    ? 'New'
                    : s === 'VIEWED'
                    ? 'Viewed'
                    : s === 'CONTACTED'
                    ? 'Contacted'
                    : lead.status;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{lead.customerName}</div>
                      {lead.editedPhone && lead.editedPhone !== (lead.originalPhone || lead.customerPhone) ? (
                        <div className="text-[11px] space-y-0.5 mt-0.5">
                          <div className="flex items-center space-x-1 font-bold text-slate-900">
                            <span>{lead.editedPhone}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Edited
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Orig: {lead.originalPhone || lead.customerPhone}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">{lead.customerPhone}</div>
                      )}
                    </td>

                    {/* Gym */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">{lead.gymName}</td>

                    {/* Provider */}
                    <td className="py-3.5 px-4 text-slate-600">{lead.providerName}</td>

                    {/* Visit Date */}
                    <td className="py-3.5 px-4 text-slate-600">{lead.visitDate}</td>

                    {/* Time */}
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{lead.time}</td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          normStatus === 'New'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : normStatus === 'Viewed'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {normStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#00A389] border border-[#00A389] rounded-lg hover:bg-[#00A389] hover:text-white transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination (SA-006) */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing 1 to {filteredLeads.length} of 42 leads
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="h-7 w-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ‹
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#00A389] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
              className="h-7 w-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* LEAD DETAILS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Lead Details
                </h3>
                <p className="text-xs text-slate-400">ID: {selectedLead.id}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Customer</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedLead.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact</span>
                  {selectedLead.editedPhone && selectedLead.editedPhone !== (selectedLead.originalPhone || selectedLead.customerPhone) ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                        <span>{selectedLead.editedPhone}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Edited
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Original: {selectedLead.originalPhone || selectedLead.customerPhone}
                      </div>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-800">{selectedLead.customerPhone}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Gym Interested</span>
                  <span className="font-bold text-slate-800">{selectedLead.gymName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Provider</span>
                  <span className="font-bold text-slate-800">{selectedLead.providerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Visit Date</span>
                  <span className="font-bold text-slate-800">{selectedLead.visitDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Time Slot</span>
                  <span className="font-bold text-slate-800">{selectedLead.time}</span>
                </div>
              </div>
            </div>

            {/* Action buttons to update status */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Update Lead:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateStatus(selectedLead.id, 'Viewed')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Mark Viewed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedLead.id, 'Contacted')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedLead.id, 'Closed')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00A389] text-white hover:bg-[#008f77] cursor-pointer"
                >
                  Mark Closed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
