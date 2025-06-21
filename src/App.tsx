
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Auth from './pages/Auth';
import DashboardPage from './pages/DashboardPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import FormulasImportPage from './pages/FormulasImportPage';
import FormulasFavoritesPage from './pages/FormulasFavoritesPage';
import ActivesFavoritesPage from './pages/ActivesFavoritesPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPage from './pages/AdminPage';
import APIManagementPage from './pages/APIManagementPage';
import SystemCustomizationPage from './pages/SystemCustomizationPage';
import PharmacyOnboardingPage from './pages/PharmacyOnboardingPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorRegisterPage from './pages/DoctorRegisterPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import MonitoringPage from './pages/MonitoringPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/prescriptions" element={<PrescriptionsPage />} />
              <Route path="/formulas/import" element={<FormulasImportPage />} />
              <Route path="/formulas/favorites" element={<FormulasFavoritesPage />} />
              <Route path="/actives/favorites" element={<ActivesFavoritesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/api-management" element={<APIManagementPage />} />
              <Route path="/system-customization" element={<SystemCustomizationPage />} />
              <Route path="/onboarding" element={<PharmacyOnboardingPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/register" element={<DoctorRegisterPage />} />
              <Route path="/doctors/accept-invitation" element={<AcceptInvitationPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
