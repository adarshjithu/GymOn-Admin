import { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Check,
  Edit2,
} from 'lucide-react';
import type { GymItem } from '../../types';

interface GymReviewModalProps {
  gym: GymItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (gymId: string) => Promise<void>;
  onReject: (gymId: string, reason?: string) => Promise<void>;
  onUpdateGym?: (gymId: string, data: Partial<GymItem>) => Promise<void>;
}

export default function GymReviewModal({
  gym,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onUpdateGym,
}: GymReviewModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editDayPass, setEditDayPass] = useState('');
  const [editMonthly, setEditMonthly] = useState('');
  const [editThreeMonth, setEditThreeMonth] = useState('');
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  if (!isOpen || !gym) return null;

  const photos =
    gym.photos && gym.photos.length > 0
      ? gym.photos
      : [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
        ];

  const isPending = gym.status === 'PENDING_APPROVAL';
  const isApproved = gym.status === 'APPROVED';
  const isRejected = gym.status === 'REJECTED';

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await onApprove(gym.id || gym._id || gym.slug);
      onClose();
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      await onReject(gym.id || gym._id || gym.slug, rejectReason);
      setShowRejectReason(false);
      onClose();
    } finally {
      setIsRejecting(false);
    }
  };

  const startEditPrices = () => {
    setEditDayPass(String(gym.dayPassPrice || 0));
    setEditMonthly(String(gym.monthlyMembershipPrice || ''));
    setEditThreeMonth(String(gym.threeMonthMembershipPrice || ''));
    setIsEditingPrice(true);
  };

  const handleSavePrices = async () => {
    if (!onUpdateGym) return;
    try {
      setIsSavingPrice(true);
      await onUpdateGym(gym.id || gym._id || gym.slug, {
        dayPassPrice: Number(editDayPass) || 0,
        monthlyMembershipPrice: editMonthly ? Number(editMonthly) : undefined,
        threeMonthMembershipPrice: editThreeMonth ? Number(editThreeMonth) : undefined,
      });
      setIsEditingPrice(false);
    } finally {
      setIsSavingPrice(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#00A389] to-[#00C49F] flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {gym.gymName}
                </h3>
                {isPending && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    Awaiting Approval
                  </span>
                )}
                {isApproved && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live & Approved
                  </span>
                )}
                {isRejected && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    Rejected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Slug: <span className="font-mono text-slate-600">/{gym.slug}</span> • City:{' '}
                <span className="font-semibold text-slate-700">{gym.city}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. Pending Approval Banner (if pending) */}
          {isPending && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Action Required: Review & Approval
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    This gym was submitted by partner provider{' '}
                    <span className="font-bold underline">{gym.providerName || 'Provider'}</span>.
                    Review amenities, rates, and verify location before publishing live to customers.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  disabled={isApproving}
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                >
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>Approve Gym</span>
                </button>
                <button
                  disabled={isRejecting}
                  onClick={() => setShowRejectReason(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}

          {/* Rejection Note Prompt Form */}
          {showRejectReason && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">
                  Provide Rejection Reason to Provider:
                </span>
                <button
                  onClick={() => setShowRejectReason(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cancel
                </button>
              </div>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete address or missing contact information..."
                className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end">
                <button
                  disabled={isRejecting}
                  onClick={handleReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Photo Gallery & Preview */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group">
              <img
                src={photos[activePhotoIndex]}
                alt={gym.gymName}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 text-white text-xs font-semibold">
                Photo {activePhotoIndex + 1} of {photos.length}
              </div>
            </div>

            {photos.length > 1 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`h-16 w-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                      activePhotoIndex === idx
                        ? 'border-[#00A389] ring-2 ring-[#00A389]/30 scale-102'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Pricing Cards Row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Gym Pricing & Passes
              </h4>
              {!isEditingPrice && onUpdateGym && (
                <button
                  onClick={startEditPrices}
                  className="text-xs font-bold text-[#00A389] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Adjust Rates</span>
                </button>
              )}
            </div>

            {isEditingPrice ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Day Pass (₹)
                    </label>
                    <input
                      type="number"
                      value={editDayPass}
                      onChange={(e) => setEditDayPass(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Monthly Pass (₹)
                    </label>
                    <input
                      type="number"
                      value={editMonthly}
                      onChange={(e) => setEditMonthly(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      3-Month Pass (₹)
                    </label>
                    <input
                      type="number"
                      value={editThreeMonth}
                      onChange={(e) => setEditThreeMonth(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditingPrice(false)}
                    className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSavingPrice}
                    onClick={handleSavePrices}
                    className="px-4 py-1.5 rounded-lg bg-[#00A389] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPrice ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    1-Day Pass
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    ₹{gym.dayPassPrice}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Single entry day pass
                  </div>
                </div>

                <div className="bg-teal-50/40 border border-teal-100 rounded-2xl p-4">
                  <div className="text-[11px] font-bold text-[#00A389] uppercase tracking-wider">
                    Monthly Membership
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {gym.monthlyMembershipPrice ? `₹${gym.monthlyMembershipPrice}` : 'Not Offered'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    30 days full gym access
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    3-Month Pass
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {gym.threeMonthMembershipPrice ? `₹${gym.threeMonthMembershipPrice}` : 'Not Offered'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Quarterly recurring access
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Provider & Location 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider Information Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <User className="h-4 w-4 text-[#00A389]" />
                <span>Gym Provider (Owner)</span>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Provider Name:</span>
                  <span className="font-bold text-slate-900">
                    {(gym as any).provider?.name || gym.providerName || 'Independent Owner'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-800">
                    {(gym as any).provider?.email || gym.providerEmail || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-medium text-slate-800">
                    {(gym as any).provider?.phone || gym.providerPhone || gym.phoneNumber || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & GPS Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-[#00A389]" />
                  <span>Location & Interactive Map</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    gym.gpsLocation?.latitude && gym.gpsLocation?.longitude
                      ? `${gym.gpsLocation.latitude},${gym.gpsLocation.longitude}`
                      : `${gym.gymName} ${gym.address || ''} ${gym.city || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#00A389] hover:underline flex items-center space-x-1"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Street Address:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[200px]">
                    {gym.address}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">City / Metro:</span>
                  <span className="font-bold text-slate-900">{gym.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {gym.gpsLocation
                      ? `${gym.gpsLocation.latitude.toFixed(4)}, ${gym.gpsLocation.longitude.toFixed(4)}`
                      : 'Coordinates not provided'}
                  </span>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 mt-2">
                <iframe
                  title={`${gym.gymName} Location Map`}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  className="w-full h-full border-0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    gym.gpsLocation?.latitude && gym.gpsLocation?.longitude
                      ? `${gym.gpsLocation.latitude},${gym.gpsLocation.longitude}`
                      : `${gym.gymName} ${gym.address || ''} ${gym.city || ''}`
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            </div>
          </div>

          {/* 5. Description */}
          {gym.description && (
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Gym Description & Overview
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {gym.description}
              </p>
            </div>
          )}

          {/* 6. Facilities & Equipment */}
          {gym.facilities && gym.facilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Facilities & Amenities ({gym.facilities.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {gym.facilities.map((facility, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center space-x-1.5"
                  >
                    <Check className="h-3 w-3 text-[#00A389] stroke-[3]" />
                    <span>{facility}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 7. Opening Hours Schedule */}
          {Array.isArray(gym.openingHours) && gym.openingHours.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Weekly Operating Schedule
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {gym.openingHours.map((slot: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-800">{slot.day}</span>
                    {slot.isClosed ? (
                      <span className="text-rose-600 font-semibold">Closed</span>
                    ) : (
                      <span className="text-slate-600 font-medium">
                        {slot.open} – {slot.close}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>Status:</span>
            <span className="font-bold uppercase text-slate-800">{gym.status}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Close
            </button>

            {isPending && (
              <>
                <button
                  disabled={isRejecting}
                  onClick={() => setShowRejectReason(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs cursor-pointer transition-all"
                >
                  Reject Gym
                </button>

                <button
                  disabled={isApproving}
                  onClick={handleApprove}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00A389] to-[#00C49F] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-teal-500/20 cursor-pointer flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve & Publish Live</span>
                    </>
                  )}
                </button>
              </>
            )}

            {isApproved && (
              <button
                disabled={isRejecting}
                onClick={() => handleReject()}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer border border-rose-200"
              >
                Unpublish / Deactivate
              </button>
            )}

            {isRejected && (
              <button
                disabled={isApproving}
                onClick={handleApprove}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Re-Approve Gym</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
