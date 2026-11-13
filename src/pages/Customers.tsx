import { useState, useEffect } from 'react';
import { Search, Download, ArrowLeft, User, History } from 'lucide-react';
import type { CustomerItem } from '../types';
import { adminApi } from '../api/adminApi';

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [mobileTab, setMobileTab] = useState<'list' | 'details'>('list');

  useEffect(() => {
    adminApi.getCustomers().then((res) => {
      const list = Array.isArray(res) ? res : (res as any)?.customers || [];
      setCustomers(list);
      if (list.length > 0) {
        setSelectedCustomer(list[0]!);
      }
    });
  }, []);

  const filteredCustomers = (customers || []).filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q);

    const matchesCity = cityFilter === 'All' || c.city === cityFilter;

    return matchesSearch && matchesCity;
  });

  const handleSelectCustomer = (cust: CustomerItem) => {
    setSelectedCustomer(cust);
    // On mobile, auto-navigate to details view
    setMobileTab('details');
  };

  return (
    <div className="space-y-5">
      {/* Title & Spec Tag */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            SA-007 Customers
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customers
          </h1>
        </div>
      </div>

      {/* Top Filter Bar (SA-007) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or mobile..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* City Filter */}
          <div className="flex-1 sm:flex-none flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <span className="hidden xs:inline">City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389]"
            >
              <option value="All">All Cities</option>
              <option value="Kochi">Kochi</option>
              <option value="Thrissur">Thrissur</option>
              <option value="Calicut">Calicut</option>
              <option value="Trivandrum">Trivandrum</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={() => alert('Exporting customers data to CSV...')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden xs:inline">Export</span>
          </button>
        </div>
      </div>

      {/* MOBILE SEGMENTED TABS (Visible only on < lg screens) */}
      <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
            mobileTab === 'list'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Customer List ({filteredCustomers.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('details')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
            mobileTab === 'details'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>{selectedCustomer ? selectedCustomer.name : 'Details'}</span>
        </button>
      </div>

      {/* SPLIT SCREEN LAYOUT (SA-007) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CUSTOMERS LIST (5 of 12 cols) */}
        <div
          className={`lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col ${
            mobileTab === 'details' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Customers ({filteredCustomers.length})</span>
            <span className="text-[10px] text-slate-400 font-medium">Tap to view</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[640px]">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No customers found matching your criteria.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;

                return (
                  <div
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust)}
                    className={`p-4 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50/60 border-l-4 border-l-[#00A389]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-[#00A389] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {cust.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{cust.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium truncate">
                          {cust.phone}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        {cust.enquiriesCount} Enquiries
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {cust.lastEnquiry}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMER DETAILS (7 of 12 cols) */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileTab === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          {selectedCustomer ? (
            <>
              {/* Back button on mobile */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMobileTab('list')}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#00A389] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Customer List</span>
                </button>
              </div>

              {/* Customer Info Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">
                  Customer Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Full Name</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {selectedCustomer.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Mobile Number</span>
                    <span className="font-bold text-slate-800">{selectedCustomer.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Email</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {selectedCustomer.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Joined On</span>
                    <span className="font-bold text-slate-800">{selectedCustomer.joinedOn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Total Enquiries</span>
                    <span className="font-bold text-[#00A389] text-sm">
                      {selectedCustomer.enquiriesCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Last Enquiry</span>
                    <span className="font-bold text-slate-800">
                      {selectedCustomer.lastEnquiry}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enquiry History Table */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">
                  Enquiry History
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[450px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase">
                        <th className="py-2.5">Date & Time</th>
                        <th className="py-2.5">Gym</th>
                        <th className="py-2.5">Provider</th>
                        <th className="py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedCustomer.enquiryHistory.map((enq) => (
                        <tr key={enq.id} className="hover:bg-slate-50">
                          <td className="py-3 text-slate-600 whitespace-nowrap">{enq.dateTime}</td>
                          <td className="py-3 font-bold text-slate-800">{enq.gymName}</td>
                          <td className="py-3 text-slate-600">{enq.providerName}</td>
                          <td className="py-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                enq.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {enq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select a customer to inspect details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
