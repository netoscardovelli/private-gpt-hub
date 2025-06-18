
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminPage from "./pages/AdminPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FormulasImportPage from "./pages/FormulasImportPage";
import FormulasFavoritesPage from "./pages/FormulasFavoritesPage";
import ActivesFavoritesPage from "./pages/ActivesFavoritesPage";
import SystemCustomizationPage from "./pages/SystemCustomizationPage";
import DoctorsPage from "./pages/DoctorsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('🚀 App component renderizando...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              
              {/* Rotas de Configurações - Fórmulas */}
              <Route path="/formulas/import" element={<FormulasImportPage />} />
              <Route path="/formulas/favorites" element={<FormulasFavoritesPage />} />
              <Route path="/actives/favorites" element={<ActivesFavoritesPage />} />
              
              {/* Rotas de Configurações - Farmácia */}
              <Route path="/settings/customization" element={<SystemCustomizationPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              
              {/* Rotas placeholder para outras páginas */}
              <Route path="/reports/formulas" element={<NotFound />} />
              <Route path="/reports/doctors" element={<NotFound />} />
              <Route path="/reports/financial" element={<NotFound />} />
              <Route path="/help/documentation" element={<NotFound />} />
              <Route path="/help/support" element={<NotFound />} />
              <Route path="/help/tutorials" element={<NotFound />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
