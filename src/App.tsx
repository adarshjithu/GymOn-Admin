import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginForm from './components/auth/LoginForm';
import AdminLayout from './components/layout/AdminLayout';

import Dashboard from './pages/Dashboard';
import GymProviders from './pages/GymProviders';
import Gyms from './pages/Gyms';
import CustomerLeads from './pages/CustomerLeads';
import Customers from './pages/Customers';
import MasterData from './pages/MasterData';
import AdminUsers from './pages/AdminUsers';

// Guard: Only Super Admin can access Admin Users management
function ProtectedAdminUsersRoute() {
  const { isSuperAdmin } = useAuth();
  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <AdminUsers />;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out of the Admin Portal?')) {
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginForm onSuccess={() => setIsLoggedIn(true)} />
              )
            }
          />

          {/* Authenticated Admin Routes */}
          <Route
            element={
              isLoggedIn ? (
                <AdminLayout onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            {/* Default redirect to Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 1. Dashboard page */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 2. Gym Providers pages (SEPARATE) */}
            <Route path="/providers" element={<GymProviders />} />
            <Route path="/providers/:providerId" element={<GymProviders />} />

            {/* 3. Gyms pages (SEPARATE) */}
            <Route path="/gyms" element={<Gyms />} />
            <Route path="/gyms/:gymId" element={<Gyms />} />

            {/* 3. Customer Leads page */}
            <Route path="/leads" element={<CustomerLeads />} />
            <Route path="/customer-leads" element={<Navigate to="/leads" replace />} />

            {/* 4. Customers page */}
            <Route path="/customers" element={<Customers />} />

            {/* 5. Master Data pages with sub-routes */}
            <Route
              path="/master-data"
              element={<Navigate to="/master-data/cities" replace />}
            />
            <Route path="/master-data/:subTab" element={<MasterData />} />

            {/* 6. Admin Users page (Only Super Admin can access) */}
            <Route path="/admins" element={<ProtectedAdminUsersRoute />} />
            <Route path="/admin-users" element={<ProtectedAdminUsersRoute />} />

            {/* Settings removed - redirect to Dashboard */}
            <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings/*" element={<Navigate to="/dashboard" replace />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
