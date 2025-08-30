
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';

// Layout components
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProducerDashboard from './pages/ProducerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import ProductionRequests from './pages/ProductionRequests';
import Marketplace from './pages/Marketplace';
import Audit from './pages/Audit';
import Profile from './pages/Profile';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main app content
const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['main_admin', 'country_admin', 'state_admin', 'city_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Producer routes */}
          <Route 
            path="/producer" 
            element={
              <ProtectedRoute allowedRoles={['producer']}>
                <ProducerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Buyer routes */}
          <Route 
            path="/buyer" 
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Auditor routes */}
          <Route 
            path="/auditor" 
            element={
              <ProtectedRoute allowedRoles={['auditor', 'main_admin', 'country_admin', 'state_admin', 'city_admin']}>
                <AuditorDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared routes */}
          <Route path="/production-requests" element={<ProductionRequests />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Layout>
  );
};

// Main App component
function App() {
  return (
    <WalletProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </WalletProvider>
  );
}

export default App;