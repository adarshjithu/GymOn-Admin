import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Mail,
  Loader2,
} from 'lucide-react';
import type { AdminUserItem } from '../types';
import { adminApi } from '../api/adminApi';

export default function AdminUsers() {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Super Admin' | 'Sub Admin'>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Add Sub Admin Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Edit Admin Modal State
  const [editingAdmin, setEditingAdmin] = useState<AdminUserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAdminUsers();
      const list = Array.isArray(res) ? res : (res as any)?.admins || (res as any)?.data || [];
      if (!list || list.length === 0) {
        // Auto-seed if empty
        const seeded = await adminApi.seedAdminUsers();
        setAdmins(seeded);
      } else {
        setAdmins(list);
      }
    } catch (err) {
      console.error(err);
      const seeded = await adminApi.seedAdminUsers();
      setAdmins(seeded);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAdmin = await adminApi.createAdminUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 98765 00000',
        role: 'Sub Admin',
      });
      adminApi.addActivityLog('Created Sub Admin', `Created Sub Admin: ${newAdmin.name}`);
      setFeedback(`Sub Admin "${newAdmin.name}" added successfully.`);
      setName('');
      setEmail('');
      setPhone('');
      setIsAddModalOpen(false);
      loadAdmins();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to add sub admin');
    }
  };

  const handleOpenEdit = (admin: AdminUserItem) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditPhone(admin.phone || '+91 98765 43210');
    setEditStatus(admin.status);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    try {
      await adminApi.updateAdminUser(editingAdmin.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        role: editingAdmin.role,
        status: editStatus,
      });
      adminApi.addActivityLog('Updated Admin', `Modified ${editingAdmin.role}: ${editName}`);
      setFeedback(`Admin account "${editName}" updated successfully.`);
      setEditingAdmin(null);
      loadAdmins();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to update admin');
    }
  };

  const handleToggleStatus = async (admin: AdminUserItem) => {
    const nextStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminApi.updateAdminStatus(admin.id, nextStatus);
      adminApi.addActivityLog('Updated Admin Status', `Changed ${admin.name} to ${nextStatus}`);
      setFeedback(`Status for "${admin.name}" updated to ${nextStatus}.`);
      loadAdmins();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (admin: AdminUserItem) => {
    if (admin.role === 'Super Admin') {
      alert('Cannot delete the primary Super Admin account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove Sub Admin "${admin.name}"?`)) return;

    try {
      await adminApi.deleteAdminUser(admin.id);
      adminApi.addActivityLog('Deleted Admin', `Removed ${admin.role} ${admin.name}`);
      setFeedback(`Sub Admin "${admin.name}" removed.`);
      loadAdmins();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete');
    }
  };

  // Metrics: only 1 Super Admin and Sub Admins
  const totalCount = admins.length;
  const superAdminCount = admins.filter((a) => a.role === 'Super Admin').length;
  const subAdminCount = admins.filter((a) => a.role === 'Sub Admin').length;

  // Filtered List
  const filteredAdmins = useMemo(() => {
    return (admins || []).filter((a) => {
      // Role Filter
      if (roleFilter !== 'ALL' && a.role !== roleFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = a.name.toLowerCase().includes(q);
        const matchEmail = a.email.toLowerCase().includes(q);
        const matchPhone = a.phone ? a.phone.toLowerCase().includes(q) : false;
        const matchRole = a.role.toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchRole;
      }
      return true;
    });
  }, [admins, roleFilter, searchQuery]);

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP TITLE & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            SA-009 ADMIN USERS
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Users</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Super Admin can manage sub-admins, permissions, and internal platform access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A389] hover:bg-[#008f77] shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Sub Admin</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. STAT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Admins */}
        <div
          onClick={() => setRoleFilter('ALL')}
          className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer transition-all ${
            roleFilter === 'ALL'
              ? 'border-slate-800 ring-2 ring-slate-800/10'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <UserCheck className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {isLoading ? '-' : totalCount}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Admin Users</p>
            <p className="text-[10px] text-slate-400">All Registered Staff</p>
          </div>
        </div>

        {/* Card 2: Super Admin */}
        <div
          onClick={() => setRoleFilter('Super Admin')}
          className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer transition-all ${
            roleFilter === 'Super Admin'
              ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
              : 'border-purple-200/90 hover:border-purple-300'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-700 leading-none">
              {isLoading ? '-' : superAdminCount}
            </div>
            <p className="text-xs font-bold text-purple-900 mt-1">Super Admin</p>
            <p className="text-[10px] text-purple-600 font-medium">Platform Owner (Only 1)</p>
          </div>
        </div>

        {/* Card 3: Sub Admin */}
        <div
          onClick={() => setRoleFilter('Sub Admin')}
          className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer transition-all ${
            roleFilter === 'Sub Admin'
              ? 'border-[#00A389] ring-2 ring-[#00A389]/20 bg-teal-50/20'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-[#00A389] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {isLoading ? '-' : subAdminCount}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">Sub Admins</p>
            <p className="text-[10px] text-slate-400">Operations & Reviews</p>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & ROLE TABS ROW */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Roles ({totalCount})
          </button>
          <button
            onClick={() => setRoleFilter('Super Admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleFilter === 'Super Admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            Super Admin ({superAdminCount})
          </button>
          <button
            onClick={() => setRoleFilter('Sub Admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleFilter === 'Sub Admin'
                ? 'bg-[#00A389] text-white shadow-xs'
                : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
            }`}
          >
            Sub Admins ({subAdminCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 4. ADMIN USERS TABLE (SA-009) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 text-[#00A389] animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading administrators...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Administrators Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No admin accounts matched your search query or role filter.
            </p>
            {(searchQuery || roleFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Admin Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAdmins.map((admin) => {
                  const isSuper = admin.role === 'Super Admin';

                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6 font-bold text-slate-800">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-9 w-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                              isSuper
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-teal-50 text-[#00A389] border-teal-200'
                            }`}
                          >
                            {admin.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-tight flex items-center space-x-1.5">
                              <span>{admin.name}</span>
                              {isSuper && (
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" title="Super Admin" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5 flex items-center space-x-2">
                              <span>{admin.phone || '+91 98765 43210'}</span>
                              {admin.lastActive && (
                                <>
                                  <span>•</span>
                                  <span>{admin.lastActive}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{admin.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isSuper ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <ShieldAlert className="h-3 w-3" />
                            <span>Super Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-[#00A389] border border-teal-200">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Sub Admin</span>
                          </span>
                        )}
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                            admin.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              admin.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{admin.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(admin)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Edit Admin"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin)}
                            disabled={isSuper}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSuper
                                ? 'text-slate-200 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                            title={isSuper ? 'Cannot delete Super Admin' : 'Delete Admin'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing {filteredAdmins.length} of {admins.length} administrator accounts
          </span>
          <span>GYMON Security & RBAC</span>
        </div>
      </div>

      {/* 5. ADD ADMIN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Add New Sub Admin</h3>
                <p className="text-[11px] text-slate-400">The Super Admin can register new internal Sub-Admin accounts.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Miller"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. david@gymon.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43214"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role Assigned</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-teal-800 font-bold">
                    <ShieldCheck className="h-4 w-4 text-[#00A389]" />
                    <span>Sub Admin</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">Fixed</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  There is only 1 Super Admin account. All new administrators are created as Sub Admins.
                </p>
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
                  Save Sub Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT ADMIN MODAL */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Edit Administrator</h3>
                <p className="text-[11px] text-slate-400">Modify details for {editingAdmin.name}</p>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00A389]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex items-center space-x-1.5 h-[38px]">
                    {editingAdmin.role === 'Super Admin' ? (
                      <>
                        <ShieldAlert className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-700 font-bold">Super Admin</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-[#00A389]" />
                        <span className="text-teal-800 font-bold">Sub Admin</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A389] cursor-pointer h-[38px]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A389] hover:bg-[#008f77] shadow-xs cursor-pointer"
                >
                  Update Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
