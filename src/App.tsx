
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";
import DoctorsPage from "./pages/DoctorsPage";
import ActivesFavoritesPage from "./pages/ActivesFavoritesPage";
import FormulasFavoritesPage from "./pages/FormulasFavoritesPage";
import FormulasImportPage from "./pages/FormulasImportPage";
import PharmacyOnboardingPage from "./pages/PharmacyOnboardingPage";
import SystemCustomizationPage from "./pages/SystemCustomizationPage";
import NotificationsPage from "./pages/NotificationsPage";
import APIManagementPage from "./pages/APIManagementPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/actives-favorites" element={<ActivesFavoritesPage />} />
            <Route path="/formulas-favorites" element={<FormulasFavoritesPage />} />
            <Route path="/formulas-import" element={<FormulasImportPage />} />
            <Route path="/pharmacy-onboarding" element={<PharmacyOnboardingPage />} />
            <Route path="/system-customization" element={<SystemCustomizationPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/api-management" element={<APIManagementPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
