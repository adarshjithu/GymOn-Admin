import {
  initialGyms,
  initialProviders,
  initialLeads,
  initialCustomers,
  initialAdminUsers,
  initialCities,
  initialFacilities,
  initialGymTypes,
  initialCrowdLevels,
  initialActivityLogs,
  initialGeneralSettings,
} from '../data/mockData';
import type {
  GymItem,
  ProviderItem,
  LeadItem,
  CustomerItem,
  AdminUserItem,
  DashboardStats,
  GymStatus,
  LeadStatus,
  MasterCity,
  MasterFacility,
  MasterGymType,
  MasterCrowdLevel,
  ActivityLogItem,
  GeneralSettings,
} from '../types';

const API_BASE_URL =
  (import.meta as any).env?.VITE_DEV_BASE_URL || 'http://localhost:5000/api/v1';

// Local in-memory state initialized from mock data and updated on offline actions
let localGyms: GymItem[] = (() => {
  const saved = localStorage.getItem('gymon_admin_gyms');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return [...initialGyms];
})();

let localProviders: ProviderItem[] = (() => {
  const saved = localStorage.getItem('gymon_admin_providers');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return [...initialProviders];
})();

let localLeads: LeadItem[] = (() => {
  const saved = localStorage.getItem('gymon_admin_leads');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return [...initialLeads];
})();

let localCustomers: CustomerItem[] = [...initialCustomers];
let localAdmins: AdminUserItem[] = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gymon_admin_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((a: any) => ({
            ...a,
            role: a.email === 'admin@gymon.in' || a.role === 'Super Admin' ? 'Super Admin' : 'Sub Admin',
          }));
        }
      } catch {
        // Fallback
      }
    }
  }
  return [...initialAdminUsers];
})();
let localCities: MasterCity[] = [...initialCities];
let localFacilities: MasterFacility[] = [...initialFacilities];
let localGymTypes: MasterGymType[] = [...initialGymTypes];
let localCrowdLevels: MasterCrowdLevel[] = [...initialCrowdLevels];
let localActivityLogs: ActivityLogItem[] = [...initialActivityLogs];
let localGeneralSettings: GeneralSettings = { ...initialGeneralSettings };

function persistLocalState() {
  localStorage.setItem('gymon_admin_gyms', JSON.stringify(localGyms));
  localStorage.setItem('gymon_admin_providers', JSON.stringify(localProviders));
  localStorage.setItem('gymon_admin_leads', JSON.stringify(localLeads));
  localStorage.setItem('gymon_admin_users', JSON.stringify(localAdmins));
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  offlineFallback?: () => T
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
  } catch (err) {
    // Network or server offline
  }

  if (offlineFallback) {
    return offlineFallback();
  }

  throw new Error('Service unavailable');
}

export const adminApi = {
  // ==================== DASHBOARD ====================
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res: any = await request<any>(
      '/admin/dashboard/stats',
      { method: 'GET' },
      () => {
        const liveGyms = localGyms.filter(
          (g) => g.status === 'APPROVED' || g.status === 'Live'
        ).length;
        const pendingGyms = localGyms.filter(
          (g) => g.status === 'PENDING_APPROVAL' || g.status === 'Pending Review'
        ).length;
        const draftGyms = localGyms.filter(
          (g) => g.status === 'DRAFT' || g.status === 'Draft'
        ).length;

        return {
          totalProviders: localProviders.length || 125,
          providersDelta: '+6 this week',
          totalGyms: localGyms.length || 210,
          liveGyms: liveGyms || 195,
          draftGyms: draftGyms || 15,
          todaysLeads: localLeads.length || 42,
          leadsDelta: '+12 vs yesterday',
          pendingApprovals: pendingGyms || 8,
          recentProviders: localProviders.slice(0, 5),
          recentLeads: localLeads.slice(0, 5),
          gyms: {
            total: localGyms.length,
            approved: liveGyms,
            pending: pendingGyms,
            rejected: localGyms.filter((g) => g.status === 'REJECTED').length,
            draft: draftGyms,
          },
          providers: {
            total: localProviders.length,
            active: localProviders.filter((p) => p.isActive).length,
          },
          leads: {
            total: localLeads.length,
            new: localLeads.filter((l) => l.status === 'New' || l.status === 'NEW').length,
          },
          recentPendingGyms: localGyms.filter(
            (g) => g.status === 'PENDING_APPROVAL' || g.status === 'Pending Review'
          ),
        };
      }
    );

    const gymsTotal = res?.gyms?.total ?? res?.totalGyms ?? 210;
    const gymsApproved = res?.gyms?.approved ?? res?.liveGyms ?? 195;
    const gymsPending = res?.gyms?.pending ?? res?.pendingApprovals ?? 8;
    const gymsDraft = res?.gyms?.draft ?? res?.draftGyms ?? 15;
    const gymsRejected = res?.gyms?.rejected ?? 0;

    const provTotal = res?.providers?.total ?? res?.totalProviders ?? 125;
    const provActive = res?.providers?.active ?? 120;

    const leadsTotal = res?.leads?.total ?? res?.todaysLeads ?? 42;
    const leadsNew = res?.leads?.new ?? 12;

    return {
      totalProviders: provTotal,
      providersDelta: res?.providersDelta || '+6 this week',
      totalGyms: gymsTotal,
      liveGyms: gymsApproved,
      draftGyms: gymsDraft,
      todaysLeads: leadsTotal,
      leadsDelta: res?.leadsDelta || '+12 vs yesterday',
      pendingApprovals: gymsPending,
      recentProviders: res?.recentProviders || localProviders.slice(0, 5),
      recentLeads: res?.recentLeads || localLeads.slice(0, 5),
      gyms: {
        total: gymsTotal,
        approved: gymsApproved,
        pending: gymsPending,
        rejected: gymsRejected,
        draft: gymsDraft,
      },
      providers: {
        total: provTotal,
        active: provActive,
      },
      leads: {
        total: leadsTotal,
        new: leadsNew,
      },
      recentPendingGyms: res?.recentPendingGyms || localGyms.filter((g) => g.status === 'PENDING_APPROVAL' || g.status === 'Pending Review'),
    };
  },

  // ==================== GYMS ====================
  getGyms: async (params?: {
    status?: string;
    search?: string;
    providerId?: string;
  }): Promise<{
    gyms: GymItem[];
    pendingCount: number;
    approvedCount: number;
    total: number;
  }> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.providerId) query.set('providerId', params.providerId);

    const res: any = await request(
      `/admin/gyms?${query.toString()}`,
      { method: 'GET' },
      () => {
        let list = [...localGyms];

        if (params?.status && params.status !== 'ALL') {
          if (params.status === 'PENDING_APPROVAL') {
            list = list.filter((g) => g.status === 'PENDING_APPROVAL' || g.status === 'Pending Review');
          } else if (params.status === 'APPROVED' || params.status === 'LIVE') {
            list = list.filter((g) => g.status === 'APPROVED' || g.status === 'Live');
          } else if (params.status === 'DRAFT') {
            list = list.filter((g) => g.status === 'DRAFT' || g.status === 'Draft');
          } else if (params.status === 'INACTIVE' || params.status === 'REJECTED') {
            list = list.filter((g) => g.status === 'REJECTED' || g.status === 'Deactivated' || !g.isActive);
          }
        }

        if (params?.search && params.search.trim()) {
          const q = params.search.toLowerCase().trim();
          list = list.filter(
            (g) =>
              g.gymName.toLowerCase().includes(q) ||
              g.city.toLowerCase().includes(q) ||
              g.address.toLowerCase().includes(q) ||
              (g.providerName && g.providerName.toLowerCase().includes(q))
          );
        }

        const pendingCount = localGyms.filter(
          (g) => g.status === 'PENDING_APPROVAL' || g.status === 'Pending Review'
        ).length;
        const approvedCount = localGyms.filter((g) => g.status === 'APPROVED' || g.status === 'Live').length;

        return {
          gyms: list,
          pendingCount,
          approvedCount,
          total: list.length,
        };
      }
    );

    const gymsList: GymItem[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.gyms)
      ? res.gyms
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return {
      gyms: gymsList,
      pendingCount: res?.pendingCount ?? gymsList.filter((g) => g.status === 'PENDING_APPROVAL' || g.status === 'Pending Review').length,
      approvedCount: res?.approvedCount ?? gymsList.filter((g) => g.status === 'APPROVED' || g.status === 'Live').length,
      total: res?.total ?? gymsList.length,
    };
  },

  getGymById: async (id: string): Promise<GymItem> => {
    return request<GymItem>(`/admin/gyms/${id}`, { method: 'GET' }, () => {
      const gym = localGyms.find((g) => g.id === id || g._id === id || g.slug === id);
      if (gym) return gym;
      throw new Error('Gym not found');
    });
  },

  approveGym: async (id: string): Promise<GymItem> => {
    return request<GymItem>(
      `/admin/gyms/${id}/approve`,
      { method: 'PATCH' },
      () => {
        const index = localGyms.findIndex(
          (g) => g.id === id || g._id === id || g.slug === id
        );
        if (index !== -1) {
          const updated: GymItem = {
            ...localGyms[index]!,
            status: 'APPROVED',
            isApproved: true,
            isActive: true,
            updatedAt: 'Just now',
          };
          localGyms[index] = updated;
          persistLocalState();
          return updated;
        }
        throw new Error('Gym not found');
      }
    );
  },

  rejectGym: async (id: string, reason?: string): Promise<GymItem> => {
    return request<GymItem>(
      `/admin/gyms/${id}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      },
      () => {
        const index = localGyms.findIndex(
          (g) => g.id === id || g._id === id || g.slug === id
        );
        if (index !== -1) {
          const updated: GymItem = {
            ...localGyms[index]!,
            status: 'REJECTED',
            isApproved: false,
            updatedAt: 'Just now',
          };
          localGyms[index] = updated;
          persistLocalState();
          return updated;
        }
        throw new Error('Gym not found');
      }
    );
  },

  updateGymStatus: async (
    id: string,
    status?: GymStatus,
    isActive?: boolean
  ): Promise<GymItem> => {
    return request<GymItem>(
      `/admin/gyms/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, isActive }),
      },
      () => {
        const index = localGyms.findIndex(
          (g) => g.id === id || g._id === id || g.slug === id
        );
        if (index !== -1) {
          const updated: GymItem = {
            ...localGyms[index]!,
            ...(status ? { status, isApproved: status === 'APPROVED' } : {}),
            ...(isActive !== undefined ? { isActive } : {}),
            updatedAt: 'Just now',
          };
          localGyms[index] = updated;
          persistLocalState();
          return updated;
        }
        throw new Error('Gym not found');
      }
    );
  },

  updateGym: async (id: string, payload: Partial<GymItem>): Promise<GymItem> => {
    return request<GymItem>(
      `/admin/gyms/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      () => {
        const index = localGyms.findIndex(
          (g) => g.id === id || g._id === id || g.slug === id
        );
        if (index !== -1) {
          const updated: GymItem = {
            ...localGyms[index]!,
            ...payload,
            updatedAt: 'Just now',
          };
          localGyms[index] = updated;
          persistLocalState();
          return updated;
        }
        throw new Error('Gym not found');
      }
    );
  },

  deleteGym: async (id: string): Promise<void> => {
    return request<void>(
      `/admin/gyms/${id}`,
      { method: 'DELETE' },
      () => {
        localGyms = localGyms.filter(
          (g) => g.id !== id && g._id !== id && g.slug !== id
        );
        persistLocalState();
      }
    );
  },

  // ==================== PROVIDERS ====================
  getProviders: async (params?: {
    search?: string;
    status?: string;
  }): Promise<{ providers: ProviderItem[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);

    const res: any = await request(
      `/admin/providers?${query.toString()}`,
      { method: 'GET' },
      () => {
        let list = [...localProviders];

        if (params?.status && params.status !== 'ALL') {
          if (params.status === 'ACTIVE') list = list.filter((p) => p.isActive);
          if (params.status === 'INACTIVE') list = list.filter((p) => !p.isActive);
        }

        if (params?.search && params.search.trim()) {
          const q = params.search.toLowerCase().trim();
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.email.toLowerCase().includes(q) ||
              p.phone.includes(q)
          );
        }

        return {
          providers: list,
          total: list.length,
        };
      }
    );

    const rawList: any[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.providers)
      ? res.providers
      : Array.isArray(res?.data)
      ? res.data
      : [];

    const provList: ProviderItem[] = rawList.map((p) => {
      const isAct = p.isActive !== false;
      return {
        ...p,
        id: p.id || p._id?.toString() || p._id,
        isActive: isAct,
        status: p.status || (isAct ? 'Active' : 'Blocked'),
        createdAt: p.createdAt || p.registeredOn || p.joinedAt,
        registeredOn: p.registeredOn || p.createdAt,
      };
    });

    return {
      providers: provList,
      total: res?.total ?? provList.length,
    };
  },

  getProviderById: async (
    id: string
  ): Promise<ProviderItem & { gyms: GymItem[] }> => {
    const res: any = await request<ProviderItem & { gyms: GymItem[] }>(
      `/admin/providers/${id}`,
      { method: 'GET' },
      () => {
        const provider = localProviders.find(
          (p) => p.id === id || p._id === id
        );
        if (!provider) throw new Error('Provider not found');

        const gyms = localGyms.filter(
          (g) =>
            g.providerId === id ||
            (g as any).provider?.id === id ||
            (g as any).provider?._id === id ||
            g.providerName === provider.name
        );

        return {
          ...provider,
          gyms,
        };
      }
    );

    const isAct = res?.isActive !== false;
    return {
      ...(res || {}),
      id: res?.id || res?._id?.toString() || id,
      isActive: isAct,
      status: res?.status || (isAct ? 'Active' : 'Blocked'),
      registeredOn: res?.registeredOn || res?.createdAt,
      gyms: Array.isArray(res?.gyms) ? res.gyms : [],
    };
  },

  createProvider: async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
  }): Promise<ProviderItem> => {
    return request<ProviderItem>(
      '/admin/providers',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        const newProvider: ProviderItem = {
          id: `prov-${Date.now()}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: 'provider',
          status: 'Active',
          isActive: true,
          gymsCount: 0,
          approvedGymsCount: 0,
          pendingGymsCount: 0,
          subProvidersCount: 0,
          createdAt: 'Just now',
          updatedAt: 'Just now',
        };
        localProviders.unshift(newProvider);
        persistLocalState();
        return newProvider;
      }
    );
  },

  updateProvider: async (
    id: string,
    data: Partial<ProviderItem>
  ): Promise<ProviderItem> => {
    const res: any = await request<ProviderItem>(
      `/admin/providers/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      () => {
        const index = localProviders.findIndex(
          (p) => p.id === id || p._id === id
        );
        if (index !== -1) {
          const updated = {
            ...localProviders[index]!,
            ...data,
            updatedAt: 'Just now',
          };
          localProviders[index] = updated;
          persistLocalState();
          return updated;
        }
        throw new Error('Provider not found');
      }
    );

    // Synchronize local fallback cache
    const index = localProviders.findIndex((p) => p.id === id || p._id === id);
    if (index !== -1) {
      localProviders[index] = {
        ...localProviders[index]!,
        ...data,
        status: data.isActive === false ? 'Blocked' : data.isActive === true ? 'Active' : localProviders[index]!.status,
      };
      persistLocalState();
    }

    const isAct = (res?.isActive ?? data.isActive) !== false;
    return {
      ...(res || {}),
      id: res?.id || res?._id?.toString() || id,
      isActive: isAct,
      status: res?.status || data.status || (isAct ? 'Active' : 'Blocked'),
    };
  },

  deleteProvider: async (id: string): Promise<void> => {
    return request<void>(
      `/admin/providers/${id}`,
      { method: 'DELETE' },
      () => {
        localProviders = localProviders.filter(
          (p) => p.id !== id && p._id !== id
        );
        persistLocalState();
      }
    );
  },

  // ==================== LEADS ====================
  getLeads: async (params?: {
    status?: string;
    search?: string;
  }): Promise<{ leads: LeadItem[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res: any = await request(
      `/admin/leads?${query.toString()}`,
      { method: 'GET' },
      () => {
        let list = [...localLeads];
        if (params?.status && params.status !== 'ALL') {
          list = list.filter((l) => l.status === params.status);
        }
        if (params?.search && params.search.trim()) {
          const q = params.search.toLowerCase().trim();
          list = list.filter(
            (l) =>
              l.customerName.toLowerCase().includes(q) ||
              l.customerPhone.includes(q) ||
              (l.customerEmail && l.customerEmail.toLowerCase().includes(q)) ||
              (l.gymName && l.gymName.toLowerCase().includes(q))
          );
        }
        return {
          leads: list,
          total: list.length,
        };
      }
    );

    const leadsList: LeadItem[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.leads)
      ? res.leads
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return {
      leads: leadsList,
      total: res?.total ?? leadsList.length,
    };
  },

  updateLeadStatus: async (id: string, status: LeadStatus): Promise<LeadItem> => {
    return request<LeadItem>(
      `/admin/leads/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      () => {
        const index = localLeads.findIndex((l) => l.id === id || l._id === id);
        if (index !== -1) {
          const updated = { ...localLeads[index]!, status };
          localLeads[index] = updated;
          persistLocalState();
          return updated;
        }
        throw new Error('Lead not found');
      }
    );
  },

  // ==================== CUSTOMERS ====================
  getCustomers: async (): Promise<CustomerItem[]> => {
    return localCustomers;
  },

  // ==================== ADMINS ====================
  getAdminUsers: async (): Promise<AdminUserItem[]> => {
    try {
      const res = await request<any>(
        '/admin/admins',
        { method: 'GET' },
        () => localAdmins
      );
      const list = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.admins || [];
      if (list && list.length > 0) {
        return list.map((a: any) => ({
          id: a.id || a._id,
          name: a.name,
          email: a.email,
          phone: a.phone || '+91 98765 43210',
          role: a.adminRole === 'Super Admin' || a.email === 'admin@gymon.in' ? 'Super Admin' : 'Sub Admin',
          status: a.status || (a.isActive !== false ? 'Active' : 'Inactive'),
          lastActive: a.lastActive || 'Active Today',
          createdAt: a.createdAt || '10 Jul 2025',
        }));
      }
      return localAdmins;
    } catch {
      return localAdmins;
    }
  },

  seedAdminUsers: async (): Promise<AdminUserItem[]> => {
    localAdmins = [...initialAdminUsers];
    persistLocalState();
    return localAdmins;
  },

  createAdminUser: async (data: {
    name: string;
    email: string;
    phone: string;
    role: 'Super Admin' | 'Sub Admin';
  }): Promise<AdminUserItem> => {
    return request<AdminUserItem>(
      '/admin/admins',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        const newAdmin: AdminUserItem = {
          id: `ADM-${Date.now()}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: 'Active',
          lastActive: 'Active Now',
          createdAt: 'Just now',
        };
        localAdmins.unshift(newAdmin);
        persistLocalState();
        return newAdmin;
      }
    );
  },

  updateAdminUser: async (
    id: string,
    data: Partial<AdminUserItem>
  ): Promise<AdminUserItem> => {
    const admin = localAdmins.find((a) => a.id === id || a._id === id);
    if (admin) {
      Object.assign(admin, data);
      persistLocalState();
      return admin;
    }
    throw new Error('Admin not found');
  },

  updateAdminStatus: async (id: string, status: 'Active' | 'Inactive'): Promise<AdminUserItem> => {
    const admin = localAdmins.find((a) => a.id === id || a._id === id);
    if (admin) {
      admin.status = status;
      persistLocalState();
      return admin;
    }
    throw new Error('Admin not found');
  },

  deleteAdminUser: async (id: string): Promise<void> => {
    localAdmins = localAdmins.filter((a) => a.id !== id && a._id !== id);
    persistLocalState();
  },

  // ==================== PROVIDER ACTIONS ====================
  approveProvider: async (id: string): Promise<ProviderItem> => {
    return adminApi.updateProvider(id, { isActive: true, status: 'Active' });
  },

  blockProvider: async (id: string): Promise<ProviderItem> => {
    return adminApi.updateProvider(id, { isActive: false, status: 'Blocked' });
  },

  unblockProvider: async (id: string): Promise<ProviderItem> => {
    return adminApi.updateProvider(id, { isActive: true, status: 'Active' });
  },

  suspendProvider: async (id: string): Promise<ProviderItem> => {
    return adminApi.updateProvider(id, { isActive: false, status: 'Blocked' });
  },

  reactivateProvider: async (id: string): Promise<ProviderItem> => {
    return adminApi.updateProvider(id, { isActive: true, status: 'Active' });
  },

  // ==================== MASTER DATA ====================
  getCities: async (): Promise<MasterCity[]> => {
    return localCities;
  },

  createCity: async (name: string): Promise<MasterCity> => {
    const newCity: MasterCity = {
      id: `city-${Date.now()}`,
      name,
      status: 'Active',
      createdOn: 'Today',
    };
    localCities.push(newCity);
    return newCity;
  },

  deleteCity: async (id: string): Promise<void> => {
    localCities = localCities.filter((c) => c.id !== id);
  },

  getFacilities: async (): Promise<MasterFacility[]> => {
    return localFacilities;
  },

  createFacility: async (name: string): Promise<MasterFacility> => {
    const newFac: MasterFacility = {
      id: `fac-${Date.now()}`,
      name,
      status: 'Active',
      createdOn: 'Today',
    };
    localFacilities.push(newFac);
    return newFac;
  },

  deleteFacility: async (id: string): Promise<void> => {
    localFacilities = localFacilities.filter((f) => f.id !== id);
  },

  getGymTypes: async (): Promise<MasterGymType[]> => {
    return localGymTypes;
  },

  createGymType: async (name: string): Promise<MasterGymType> => {
    const newType: MasterGymType = {
      id: `gt-${Date.now()}`,
      name,
      status: 'Active',
      createdOn: 'Today',
    };
    localGymTypes.push(newType);
    return newType;
  },

  deleteGymType: async (id: string): Promise<void> => {
    localGymTypes = localGymTypes.filter((t) => t.id !== id);
  },

  getCrowdLevels: async (): Promise<MasterCrowdLevel[]> => {
    return localCrowdLevels;
  },

  createCrowdLevel: async (name: string): Promise<MasterCrowdLevel> => {
    const newLevel: MasterCrowdLevel = {
      id: `cl-${Date.now()}`,
      name,
      status: 'Active',
      createdOn: 'Today',
    };
    localCrowdLevels.push(newLevel);
    return newLevel;
  },

  deleteCrowdLevel: async (id: string): Promise<void> => {
    localCrowdLevels = localCrowdLevels.filter((cl) => cl.id !== id);
  },

  // ==================== ACTIVITY LOGS ====================
  getActivityLogs: async (): Promise<ActivityLogItem[]> => {
    return localActivityLogs;
  },

  addActivityLog: (action: string, details: string, admin: string = 'Admin') => {
    localActivityLogs.unshift({
      id: `act-${Date.now()}`,
      dateTime: 'Today, Just now',
      admin,
      action,
      details,
    });
  },

  // ==================== SETTINGS ====================
  getGeneralSettings: async (): Promise<GeneralSettings> => {
    return localGeneralSettings;
  },

  updateGeneralSettings: async (settings: Partial<GeneralSettings>): Promise<GeneralSettings> => {
    localGeneralSettings = { ...localGeneralSettings, ...settings };
    return localGeneralSettings;
  },
};
