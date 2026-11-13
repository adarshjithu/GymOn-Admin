import type { ComponentType } from 'react';

export interface NavItem {
  name: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  subItems?: string[];
}

export type GymStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'DRAFT' | 'REJECTED' | 'Live' | 'Draft' | 'Pending Review' | 'Deactivated';

export interface IGPSLocation {
  latitude: number;
  longitude: number;
}

export interface IOpeningHour {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface IHoliday {
  date: string;
  name: string;
  isClosed: boolean;
}

export interface GymItem {
  id: string;
  _id?: string;
  gymName: string;
  slug: string;
  address: string;
  city: string;
  phoneNumber?: string;
  gymType?: string; // Unisex, Men Only, Women Only
  dayPassPrice: number; // Entry fee
  monthlyMembershipPrice?: number;
  threeMonthMembershipPrice?: number;
  description?: string;
  photos?: string[];
  facilities?: string[];
  holidays?: IHoliday[];
  openingHours?: IOpeningHour[] | string;
  gpsLocation?: IGPSLocation;
  status: 'Live' | 'Draft' | 'Pending Review' | 'Deactivated' | 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'DRAFT';
  isApproved: boolean;
  isActive: boolean;
  providerId?: string;
  providerName: string;
  providerEmail?: string;
  providerPhone?: string;
  provider?: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  submittedOn?: string;
  approvedOn?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderItem {
  id: string;
  _id?: string;
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  gstNumber?: string;
  role: 'provider' | 'sub_provider' | 'admin';
  status: 'Active' | 'Pending' | 'Suspended' | 'Blocked';
  isActive: boolean;
  gymsCount: number;
  registeredGyms?: GymItem[];
  subProvidersCount?: number;
  pendingGymsCount?: number;
  approvedGymsCount?: number;
  registeredOn?: string;
  joinedAt?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  timeline?: {
    date: string;
    title: string;
  }[];
}

export type LeadStatus = 'New' | 'Viewed' | 'Contacted' | 'Closed' | 'NEW' | 'CONTACTED' | 'CLOSED' | 'VIEWED';

export interface LeadItem {
  id: string;
  _id?: string;
  customerName: string;
  customerPhone: string;
  originalPhone?: string;
  editedPhone?: string;
  isPhoneEdited?: boolean;
  phoneEditedAt?: string;
  customerEmail?: string;
  gymName: string;
  gymCity?: string;
  providerName: string;
  visitDate: string;
  time: string;
  status: 'New' | 'Viewed' | 'Contacted' | 'Closed' | 'NEW' | 'CONTACTED' | 'CLOSED' | 'VIEWED';
  source?: string;
  message?: string;
  createdAt?: string;
}

export interface CustomerEnquiry {
  id: string;
  dateTime: string;
  gymName: string;
  providerName: string;
  status: 'Completed' | 'Pending';
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  enquiriesCount: number;
  lastEnquiry: string;
  joinedOn: string;
  city?: string;
  enquiryHistory: CustomerEnquiry[];
}

export interface MasterCity {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  createdOn: string;
}

export interface MasterFacility {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  createdOn: string;
}

export interface MasterGymType {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  createdOn: string;
}

export interface MasterCrowdLevel {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  createdOn: string;
}

export interface AdminUserItem {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Super Admin' | 'Sub Admin';
  status: 'Active' | 'Inactive';
  lastActive?: string;
  createdAt?: string;
}

export interface ActivityLogItem {
  id: string;
  dateTime: string;
  admin: string;
  action: string;
  details: string;
}

export interface GeneralSettings {
  platformName: string;
  supportEmail: string;
  supportWhatsApp: string;
  privacyPolicyUrl: string;
  termsConditionsUrl: string;
  logoUrl?: string;
}

export interface DashboardStats {
  totalProviders: number;
  providersDelta: string;
  totalGyms: number;
  liveGyms: number;
  draftGyms: number;
  todaysLeads: number;
  leadsDelta: string;
  pendingApprovals: number;
  recentProviders: ProviderItem[];
  recentLeads: LeadItem[];
  gyms?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    draft: number;
  };
  providers?: {
    total: number;
    active: number;
  };
  leads?: {
    total: number;
    new: number;
  };
  recentPendingGyms?: GymItem[];
}
