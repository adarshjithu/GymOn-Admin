import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Sub Admin';
}

interface AuthContextType {
  currentAdmin: CurrentAdmin;
  login: (email: string, explicitRole?: 'Super Admin' | 'Sub Admin') => void;
  switchRole: (role: 'Super Admin' | 'Sub Admin') => void;
  logout: () => void;
  isSuperAdmin: boolean;
}

const DEFAULT_SUPER_ADMIN: CurrentAdmin = {
  id: 'adm-1',
  name: 'Admin',
  email: 'admin@gymon.in',
  role: 'Super Admin',
};

const AuthContext = createContext<AuthContextType>({
  currentAdmin: DEFAULT_SUPER_ADMIN,
  login: () => {},
  switchRole: () => {},
  logout: () => {},
  isSuperAdmin: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin>(() => {
    try {
      const saved = localStorage.getItem('gymon_current_admin');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'Super Admin' || parsed.role === 'Sub Admin')) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SUPER_ADMIN;
  });

  useEffect(() => {
    try {
      localStorage.setItem('gymon_current_admin', JSON.stringify(currentAdmin));
    } catch {
      // Ignore
    }
  }, [currentAdmin]);

  const login = (email: string, explicitRole?: 'Super Admin' | 'Sub Admin') => {
    const role: 'Super Admin' | 'Sub Admin' =
      explicitRole || (email.toLowerCase().trim() === 'admin@gymon.in' ? 'Super Admin' : 'Sub Admin');
    const name = role === 'Super Admin' ? 'Admin' : (email.split('@')[0] || 'Sub Admin');
    setCurrentAdmin({
      id: role === 'Super Admin' ? 'adm-1' : `sub-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      role,
    });
  };

  const switchRole = (role: 'Super Admin' | 'Sub Admin') => {
    if (role === 'Super Admin') {
      setCurrentAdmin(DEFAULT_SUPER_ADMIN);
    } else {
      setCurrentAdmin({
        id: 'adm-2',
        name: 'John Doe',
        email: 'john@gymon.in',
        role: 'Sub Admin',
      });
    }
  };

  const logout = () => {
    setCurrentAdmin(DEFAULT_SUPER_ADMIN);
  };

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        login,
        switchRole,
        logout,
        isSuperAdmin: currentAdmin.role === 'Super Admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

