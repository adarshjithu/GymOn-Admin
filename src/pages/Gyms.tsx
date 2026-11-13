import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  PauseCircle,
  Search,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Eye,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Check,
  XCircle,
  Trash2,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';
import type { GymItem } from '../types';
import { adminApi } from '../api/adminApi';
import GymReviewModal from '../components/gyms/GymReviewModal';

export default function Gyms() {
  const { gymId } = useParams<{ gymId?: string }>();
  const navigate = useNavigate();
  const { refreshPendingCount } = useOutletContext<{ refreshPendingCount?: () => void }>() || {};

  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'recently' | 'price-asc' | 'price-desc' | 'name'>('recently');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Modal review state
  const [selectedGymForModal, setSelectedGymForModal] = useState<GymItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Active photo lightbox/preview
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const fetchGyms = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getGyms();
      const list = Array.isArray(res?.gyms) ? res.gyms : Array.isArray(res) ? res : [];
      setGyms(list);
    } catch (err: any) {
      console.error('Failed to load gyms:', err);
      setGyms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  // When gymId route parameter is present, resolve the gym
  const detailGym = useMemo(() => {
    if (!gymId) return null;
    return gyms.find((g) => g.id === gymId || g._id === gymId || g.slug === gymId) || null;
  }, [gymId, gyms]);

  // Compute metric counts
  const totalGyms = gyms.length;
  const pendingCount = gyms.filter(
    (g) => g.status === 'PENDING_APPROVAL' || g.status === 'Pending Review'
  ).length;
  const approvedCount = gyms.filter(
    (g) => g.status === 'APPROVED' || g.status === 'Live'
  ).length;
  const inactiveCount = gyms.filter(
    (g) => g.status === 'REJECTED' || g.status === 'DRAFT' || g.status === 'Draft' || g.status === 'Deactivated' || !g.isActive
  ).length;

  // Filter and Sort gyms
  const filteredGyms = useMemo(() => {
    return gyms
      .filter((gym) => {
        // Status tab filtering
        if (statusFilter === 'PENDING_APPROVAL') {
          if (gym.status !== 'PENDING_APPROVAL' && gym.status !== 'Pending Review') return false;
        } else if (statusFilter === 'APPROVED') {
          if (gym.status !== 'APPROVED' && gym.status !== 'Live') return false;
        } else if (statusFilter === 'INACTIVE') {
          if (
            gym.status !== 'REJECTED' &&
            gym.status !== 'DRAFT' &&
            gym.status !== 'Draft' &&
            gym.status !== 'Deactivated' &&
            gym.isActive
          )
            return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = gym.gymName.toLowerCase().includes(q);
          const matchCity = gym.city?.toLowerCase().includes(q);
          const matchAddr = gym.address?.toLowerCase().includes(q);
          const matchProv =
            gym.providerName?.toLowerCase().includes(q) ||
            (gym as any).provider?.name?.toLowerCase().includes(q);
          return matchName || matchCity || matchAddr || matchProv;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.dayPassPrice - b.dayPassPrice;
        if (sortBy === 'price-desc') return b.dayPassPrice - a.dayPassPrice;
        if (sortBy === 'name') return a.gymName.localeCompare(b.gymName);
        return 0; // Default: recently added
      });
  }, [gyms, searchQuery, statusFilter, sortBy]);

  const handleApprove = async (id: string) => {
    try {
      const updated = await adminApi.approveGym(id);
      adminApi.addActivityLog('Approved Gym', `Approved registration for ${updated.gymName}`);
      setGyms((prev) =>
        prev.map((g) => (g.id === id || g._id === id || g.slug === id ? updated : g))
      );
      if (refreshPendingCount) refreshPendingCount();
      setFeedbackBanner({
        type: 'success',
        text: `Gym "${updated.gymName}" has been successfully approved and published Live!`,
      });
      setTimeout(() => setFeedbackBanner(null), 4000);
    } catch (err: any) {
      setFeedbackBanner({
        type: 'error',
        text: err?.message || 'Failed to approve gym.',
      });
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    try {
      const updated = await adminApi.rejectGym(id, reason);
      adminApi.addActivityLog('Rejected Gym', `Rejected gym registration ${updated.gymName}`);
      setGyms((prev) =>
        prev.map((g) => (g.id === id || g._id === id || g.slug === id ? updated : g))
      );
      if (refreshPendingCount) refreshPendingCount();
      setFeedbackBanner({
        type: 'info',
        text: `Gym "${updated.gymName}" registration has been marked as rejected.`,
      });
      setTimeout(() => setFeedbackBanner(null), 4000);
    } catch (err: any) {
      setFeedbackBanner({
        type: 'error',
        text: err?.message || 'Failed to reject gym.',
      });
    }
  };

  const handleDeactivate = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this gym? Customers will no longer be able to purchase passes.')) {
      try {
        const updated = await adminApi.updateGym(id, {
          status: 'Deactivated',
          isActive: false,
        });
        adminApi.addActivityLog('Deactivated Gym', `Deactivated ${updated.gymName}`);
        setGyms((prev) =>
          prev.map((g) => (g.id === id || g._id === id || g.slug === id ? updated : g))
        );
        if (refreshPendingCount) refreshPendingCount();
        setFeedbackBanner({
          type: 'info',
          text: `Gym "${updated.gymName}" has been deactivated.`,
        });
        setTimeout(() => setFeedbackBanner(null), 4000);
      } catch (err: any) {
        setFeedbackBanner({
          type: 'error',
          text: err?.message || 'Failed to deactivate gym.',
        });
      }
    }
  };

  const handleDelete = async (gym: GymItem) => {
    if (window.confirm(`Are you sure you want to delete gym "${gym.gymName}"? This action cannot be undone.`)) {
      try {
        await adminApi.deleteGym(gym.id || gym._id || gym.slug);
        adminApi.addActivityLog('Deleted Gym', `Removed gym ${gym.gymName}`);
        setGyms((prev) => prev.filter((g) => g.id !== gym.id && g._id !== gym._id));
        if (refreshPendingCount) refreshPendingCount();
        setFeedbackBanner({
          type: 'info',
          text: `Gym "${gym.gymName}" was permanently removed.`,
        });
        setTimeout(() => setFeedbackBanner(null), 4000);
      } catch (err: any) {
        setFeedbackBanner({
          type: 'error',
          text: err?.message || 'Failed to delete gym.',
        });
      }
    }
  };

  const handleUpdateGym = async (id: string, data: Partial<GymItem>) => {
    const updated = await adminApi.updateGym(id, data);
    setGyms((prev) =>
      prev.map((g) => (g.id === id || g._id === id || g.slug === id ? updated : g))
    );
    setSelectedGymForModal(updated);
  };

  // =========================================================================
  // VIEW 1: SA-005 GYM DETAILS (When URL is /gyms/:gymId)
  // =========================================================================
  if (gymId) {
    if (isLoading && !detailGym) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#00A389] animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading gym details...</p>
        </div>
      );
    }

    if (!detailGym) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-black text-slate-800">Gym Not Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No registered gym matching identifier "{gymId}" could be located in the database.
          </p>
          <button
            onClick={() => navigate('/gyms')}
            className="px-5 py-2.5 rounded-xl bg-[#00A389] text-white text-xs font-bold shadow-md hover:bg-[#008f77] cursor-pointer"
          >
            Return to Gyms
          </button>
        </div>
      );
    }

    const isPending =
      detailGym.status === 'PENDING_APPROVAL' || detailGym.status === 'Pending Review';
    const isLive = detailGym.status === 'APPROVED' || detailGym.status === 'Live';

    const photos =
      detailGym.photos && detailGym.photos.length > 0
        ? detailGym.photos
        : [
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
          ];

    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation & Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/gyms')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-[#00A389] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Gyms</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SA-005 Gym Details
            </span>
            <button
              onClick={() => alert(`Public preview of ${detailGym.gymName} in customer app`)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              Preview Customer Page
            </button>
            <button
              onClick={() => {
                setSelectedGymForModal(detailGym);
                setIsReviewModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackBanner && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
              feedbackBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : feedbackBanner.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedbackBanner.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedbackBanner.text}</span>
            </div>
            <button
              onClick={() => setFeedbackBanner(null)}
              className="font-bold underline hover:opacity-80 cursor-pointer ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Gym Header Card with 3 Photos Gallery */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Gym Name & Meta */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {detailGym.gymName}
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                    isLive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : isPending
                      ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                      : detailGym.status === 'Draft' || detailGym.status === 'DRAFT'
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  {isLive ? 'Live' : isPending ? 'Pending Review' : detailGym.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  Provider:{' '}
                  <button
                    onClick={() => {
                      if (detailGym.providerId) {
                        navigate(`/providers/${detailGym.providerId}`);
                      } else {
                        navigate('/providers');
                      }
                    }}
                    className="font-bold text-[#00A389] hover:underline cursor-pointer"
                  >
                    {detailGym.providerName || (detailGym as any).provider?.name || 'Partner Provider'}
                  </button>
                </span>
                <span>•</span>
                <span>Submitted On: {detailGym.submittedOn || '13 Jul 2025, 11:20 AM'}</span>
                {detailGym.approvedOn && (
                  <>
                    <span>•</span>
                    <span>Approved On: {detailGym.approvedOn}</span>
                  </>
                )}
              </div>
            </div>

            {/* Photos Gallery: 3 photos */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-1">
              {photos.slice(0, 3).map((photo, i) => (
                <div
                  key={i}
                  className="h-20 w-28 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 group relative cursor-pointer"
                  onClick={() => setPreviewPhoto(photo)}
                >
                  <img
                    src={photo}
                    alt={`Gym photo ${i + 1}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
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
                  {detailGym.address}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">City</span>
                <span className="font-bold text-slate-800">{detailGym.city}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Gym Type</span>
                <span className="font-bold text-slate-800">{detailGym.gymType || 'Unisex'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Entry Fee</span>
                <span className="font-black text-[#00A389] text-sm">
                  ₹{detailGym.dayPassPrice}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Monthly Fee</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{detailGym.monthlyMembershipPrice || 2000}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Opening Hours</span>
                <span className="font-bold text-slate-800">
                  {typeof detailGym.openingHours === 'string'
                    ? detailGym.openingHours
                    : '6:00 AM - 10:00 PM'}
                </span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 font-medium block mb-1">Description</span>
                <p className="text-slate-600 leading-relaxed font-normal">
                  {detailGym.description ||
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
                <h3 className="text-sm font-black text-slate-800 tracking-tight">Facilities</h3>
                <span className="text-xs font-bold text-[#00A389] cursor-pointer hover:underline">
                  View All ({detailGym.facilities?.length || 8})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(detailGym.facilities && detailGym.facilities.length > 0
                  ? detailGym.facilities
                  : [
                      'Parking',
                      'Locker',
                      'Shower',
                      'Air Conditioning',
                      'Wi-Fi',
                      'Cardio',
                      'Personal Trainer',
                      'Steam Bath',
                    ]
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
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">Holidays</h3>
              <div className="space-y-2.5 text-xs">
                {(
                  detailGym.holidays || [
                    { date: '15 Aug 2025', name: 'Independence Day', isClosed: true },
                    { date: '2 Oct 2025', name: 'Gandhi Jayanti', isClosed: true },
                    { date: '20 Dec 2025', name: 'Gym Anniversary', isClosed: true },
                  ]
                ).map((holiday, idx) => (
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

        {/* Gym Location & Interactive Map Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-[#00A389]" />
              <h3 className="text-sm font-black text-slate-800 tracking-tight">
                Gym Location & Interactive Map
              </h3>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                detailGym.gpsLocation?.latitude && detailGym.gpsLocation?.longitude
                  ? `${detailGym.gpsLocation.latitude},${detailGym.gpsLocation.longitude}`
                  : `${detailGym.gymName} ${detailGym.address} ${detailGym.city}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#00A389] hover:text-[#008f77] hover:underline bg-[#00A389]/10 px-3 py-1.5 rounded-lg transition-colors w-fit"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">Full Address</span>
              <span className="font-bold text-slate-800 leading-snug">{detailGym.address}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">City / Region</span>
              <span className="font-bold text-slate-800">{detailGym.city}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">GPS Coordinates</span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">
                {detailGym.gpsLocation
                  ? `${detailGym.gpsLocation.latitude.toFixed(4)}, ${detailGym.gpsLocation.longitude.toFixed(4)}`
                  : 'Coordinates not provided'}
              </span>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-inner">
            <iframe
              title={`${detailGym.gymName} Location Map`}
              width="100%"
              height="100%"
              loading="lazy"
              className="w-full h-full border-0"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                detailGym.gpsLocation?.latitude && detailGym.gpsLocation?.longitude
                  ? `${detailGym.gpsLocation.latitude},${detailGym.gpsLocation.longitude}`
                  : `${detailGym.gymName} ${detailGym.address} ${detailGym.city}`
              )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>

        {/* Bottom Action Bar (SA-005 Bottom Bar) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Actions for <strong className="text-slate-800">{detailGym.gymName}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Approve Gym Button */}
            {isPending ? (
              <>
                <button
                  onClick={() => handleApprove(detailGym.id || detailGym._id || detailGym.slug)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs bg-[#00A389] hover:bg-[#008f77] text-white shadow-md shadow-[#00A389]/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve Gym</span>
                </button>
                <button
                  onClick={() => handleReject(detailGym.id || detailGym._id || detailGym.slug)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Reject Gym
                </button>
              </>
            ) : isLive ? (
              <>
                <div className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Gym is Live</span>
                </div>
                <button
                  onClick={() => handleDeactivate(detailGym.id || detailGym._id || detailGym.slug)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Deactivate Gym
                </button>
              </>
            ) : (
              <button
                onClick={() => handleApprove(detailGym.id || detailGym._id || detailGym.slug)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs bg-[#00A389] hover:bg-[#008f77] text-white shadow-md shadow-[#00A389]/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Reactivate Gym</span>
              </button>
            )}

            {/* More Actions Dropdown */}
            <button
              onClick={() => handleDelete(detailGym)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Delete Gym
            </button>
          </div>
        </div>

        {/* Photo Lightbox Preview */}
        {previewPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setPreviewPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={previewPhoto}
                alt="Gym Preview"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/90 cursor-pointer"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* Gym Review / Edit Modal */}
        <GymReviewModal
          gym={selectedGymForModal}
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedGymForModal(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onUpdateGym={handleUpdateGym}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SA-003 GYMS LIST (/gyms)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* 1. TOP METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gyms */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer transition-all ${
            statusFilter === 'ALL'
              ? 'border-slate-800 ring-2 ring-slate-800/10'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {isLoading ? '-' : totalGyms}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Gyms</p>
            <p className="text-[10px] text-slate-400">All Registered Locations</p>
          </div>
        </div>

        {/* Pending Approval (Highlighted Alert Card) */}
        <div
          onClick={() => setStatusFilter('PENDING_APPROVAL')}
          className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer transition-all ${
            statusFilter === 'PENDING_APPROVAL'
              ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
              : 'border-amber-200/90 hover:border-amber-300'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 relative">
            <Clock className="h-6 w-6" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
            )}
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700 leading-none flex items-center space-x-2">
              <span>{isLoading ? '-' : pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                  Review
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-amber-900 mt-1">Pending Approval</p>
            <p className="text-[10px] text-amber-600 font-medium">Awaiting Verification</p>
          </div>
        </div>

        {/* Approved Live */}
        <div
          onClick={() => setStatusFilter('APPROVED')}
          className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer transition-all ${
            statusFilter === 'APPROVED'
              ? 'border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-[#00A389] flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {isLoading ? '-' : approvedCount}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">Approved & Live</p>
            <p className="text-[10px] text-slate-400">Published to Customers</p>
          </div>
        </div>

        {/* Inactive / Draft */}
        <div
          onClick={() => setStatusFilter('INACTIVE')}
          className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center space-x-4 cursor-pointer transition-all ${
            statusFilter === 'INACTIVE'
              ? 'border-slate-400 ring-2 ring-slate-400/20 bg-slate-50/50'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <PauseCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {isLoading ? '-' : inactiveCount}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">Draft / Inactive</p>
            <p className="text-[10px] text-slate-400">Paused or Rejected</p>
          </div>
        </div>
      </div>

      {/* Feedback Alert Banner */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            feedbackBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : feedbackBanner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedbackBanner.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="font-bold underline hover:opacity-80 cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. FILTER TABS & SEARCH CONTROLS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>All Gyms</span>
              <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
                {totalGyms}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('PENDING_APPROVAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'PENDING_APPROVAL'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Pending Review</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-white text-amber-900 font-extrabold text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'APPROVED'
                  ? 'bg-[#00A389] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Live / Approved</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-200/60 text-slate-700 text-[10px]">
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'INACTIVE'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Draft / Inactive</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-200/60 text-slate-700 text-[10px]">
                {inactiveCount}
              </span>
            </button>
          </div>

          <button
            onClick={fetchGyms}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by gym name, city, provider..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
            />
          </div>

          {/* Sort & View Toggle */}
          <div className="flex items-center space-x-3 justify-end">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort gyms"
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389] cursor-pointer"
              >
                <option value="recently">Recently Added</option>
                <option value="price-asc">Day Pass: Low to High</option>
                <option value="price-desc">Day Pass: High to Low</option>
                <option value="name">Gym Name (A-Z)</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GYMS CONTENT (TABLE OR GRID) */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#00A389] animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading gyms...</p>
        </div>
      ) : filteredGyms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Gyms Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No gyms matched your filter selection. Try selecting another tab or clearing search.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Gym & Location</th>
                  <th className="px-6 py-3.5">Provider (Partner)</th>
                  <th className="px-6 py-3.5">Gym Type</th>
                  <th className="px-6 py-3.5">Pass Rates</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGyms.map((gym) => {
                  const isPending =
                    gym.status === 'PENDING_APPROVAL' || gym.status === 'Pending Review';
                  const isApproved = gym.status === 'APPROVED' || gym.status === 'Live';
                  const thumbnail =
                    gym.photos && gym.photos[0]
                      ? gym.photos[0]
                      : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80';

                  const gymTargetId = gym.id || gym._id || gym.slug;

                  return (
                    <tr
                      key={gymTargetId}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Gym & Location */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={thumbnail}
                            alt=""
                            className="h-12 w-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <button
                              onClick={() => navigate(`/gyms/${gymTargetId}`)}
                              className="font-bold text-slate-900 hover:text-[#00A389] transition-colors text-left line-clamp-1 cursor-pointer text-sm"
                            >
                              {gym.gymName}
                            </button>
                            <div className="flex items-center space-x-1 text-slate-500 mt-0.5">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {gym.city} • {gym.address}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (gym.providerId) {
                              navigate(`/providers/${gym.providerId}`);
                            } else {
                              navigate('/providers');
                            }
                          }}
                          className="font-semibold text-slate-800 hover:text-[#00A389] hover:underline cursor-pointer block text-left"
                        >
                          {(gym as any).provider?.name || gym.providerName || 'Partner Provider'}
                        </button>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {(gym as any).provider?.email || gym.providerEmail || gym.phoneNumber}
                        </div>
                      </td>

                      {/* Gym Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700">
                          <Layers className="h-3 w-3 text-slate-400" />
                          <span>{gym.gymType || 'Unisex'}</span>
                        </span>
                      </td>

                      {/* Pass Rates */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">
                          ₹{gym.dayPassPrice}
                          <span className="text-[10px] font-medium text-slate-400 ml-1">/ day</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {gym.monthlyMembershipPrice
                            ? `₹${gym.monthlyMembershipPrice}/mo`
                            : '₹2000/mo'}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Live</span>
                          </span>
                        )}
                        {(gym.status === 'REJECTED' || gym.status === 'Deactivated') && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="h-3 w-3 text-rose-600" />
                            <span>{gym.status}</span>
                          </span>
                        )}
                        {(gym.status === 'DRAFT' || gym.status === 'Draft') && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isPending ? (
                            <>
                              {/* Main Review & Approve Button */}
                              <button
                                onClick={() => navigate(`/gyms/${gymTargetId}`)}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
                              >
                                <span>Review & Approve</span>
                              </button>

                              {/* Quick 1-click Approve */}
                              <button
                                onClick={() => handleApprove(gymTargetId)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-colors"
                                title="Quick 1-Click Approve"
                              >
                                <Check className="h-4 w-4 stroke-[2.5]" />
                              </button>

                              {/* Quick Reject */}
                              <button
                                onClick={() => handleReject(gymTargetId)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors"
                                title="Quick Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => navigate(`/gyms/${gymTargetId}`)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={() => handleDelete(gym)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                title="Delete Gym"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredGyms.length} of {gyms.length} gyms
            </span>
            <span>GYMON Platform Administration</span>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGyms.map((gym) => {
            const isPending =
              gym.status === 'PENDING_APPROVAL' || gym.status === 'Pending Review';
            const isApproved = gym.status === 'APPROVED' || gym.status === 'Live';
            const thumbnail =
              gym.photos && gym.photos[0]
                ? gym.photos[0]
                : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80';

            const gymTargetId = gym.id || gym._id || gym.slug;

            return (
              <div
                key={gymTargetId}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 right-3">
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md animate-pulse">
                          Pending Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md">
                          Live & Approved
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="text-base font-bold drop-shadow-xs">{gym.gymName}</div>
                      <div className="text-xs text-slate-200 flex items-center space-x-1 drop-shadow-xs">
                        <MapPin className="h-3 w-3" />
                        <span>{gym.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Provider:</span>
                      <button
                        onClick={() => {
                          if (gym.providerId) navigate(`/providers/${gym.providerId}`);
                          else navigate('/providers');
                        }}
                        className="font-bold text-slate-800 hover:text-[#00A389] hover:underline cursor-pointer"
                      >
                        {(gym as any).provider?.name || gym.providerName || 'Partner Provider'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Day Pass Rate:</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₹{gym.dayPassPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/gyms/${gymTargetId}`)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                        isPending
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{isPending ? 'Review & Approve' : 'View Details'}</span>
                    </button>
                    {isPending && (
                      <button
                        onClick={() => handleApprove(gymTargetId)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        title="1-Click Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. GYM REVIEW & APPROVAL MODAL */}
      <GymReviewModal
        gym={selectedGymForModal}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedGymForModal(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdateGym={handleUpdateGym}
      />
    </div>
  );
}
