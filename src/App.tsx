
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/theme-provider";
import { Layout } from "@/components/layout/layout";
import { AuthProvider } from "@/context/auth-context";
import { LanguageProvider } from "@/context/language-context";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Leader Pages
import LeaderDashboard from "@/pages/leader/LeaderDashboard";
import LeaderCreateProject from "@/pages/leader/LeaderCreateProject";
import LeaderAddProgress from "@/pages/leader/LeaderAddProgress";
import LeaderViewProgress from "@/pages/leader/LeaderViewProgress";
import LeaderRequestPayment from "@/pages/leader/LeaderRequestPayment";
import LeaderViewPayment from "@/pages/leader/LeaderViewPayment";

// Checker Pages
import CheckerDashboard from "./pages/checker/CheckerDashboard";
import CheckerReviewSubmissions from "./pages/checker/CheckerReviewSubmissions";
import CheckerReviewHistory from "@/pages/checker/CheckerReviewHistory";
import CheckerProjects from "@/pages/checker/CheckerProjects";

// Owner Pages
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import OwnerPaymentQueue from "./pages/owner/OwnerPaymentQueue";
import OwnerProjects from "@/pages/owner/OwnerProjects";
import OwnerStatistics from "@/pages/owner/OwnerStatistics";
import OwnerBackupLinks from "@/pages/owner/OwnerBackupLinks";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCredentials from "./pages/admin/AdminCredentials";
import AdminVehicles from "@/pages/admin/AdminVehicles";
import AdminDrivers from "@/pages/admin/AdminDrivers";
import AdminStatistics from "@/pages/admin/AdminStatistics";
import AdminBackup from "@/pages/admin/AdminBackup";
import AdminExportData from "@/pages/admin/AdminExportData";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Leader Routes */}
              <Route path="/leader" element={<Layout><LeaderDashboard /></Layout>} />
              <Route path="/leader/create-project" element={<Layout><LeaderCreateProject /></Layout>} />
              <Route path="/leader/add-progress" element={<Layout><LeaderAddProgress /></Layout>} />
              <Route path="/leader/view-progress" element={<Layout><LeaderViewProgress /></Layout>} />
              <Route path="/leader/request-payment" element={<Layout><LeaderRequestPayment /></Layout>} />
              <Route path="/leader/view-payment" element={<Layout><LeaderViewPayment /></Layout>} />
              
              {/* Checker Routes */}
              <Route path="/checker" element={<Layout><CheckerDashboard /></Layout>} />
              <Route path="/checker/review-submissions" element={<Layout><CheckerReviewSubmissions /></Layout>} />
              <Route path="/checker/review-history" element={<Layout><CheckerReviewHistory /></Layout>} />
              <Route path="/checker/projects" element={<Layout><CheckerProjects /></Layout>} />
              
              {/* Owner Routes */}
              <Route path="/owner" element={<Layout><OwnerDashboard /></Layout>} />
              <Route path="/owner/payment-queue" element={<Layout><OwnerPaymentQueue /></Layout>} />
              <Route path="/owner/projects" element={<Layout><OwnerProjects /></Layout>} />
              <Route path="/owner/statistics" element={<Layout><OwnerStatistics /></Layout>} />
              <Route path="/owner/backup-links" element={<Layout><OwnerBackupLinks /></Layout>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
              <Route path="/admin/credentials" element={<Layout><AdminCredentials /></Layout>} />
              <Route path="/admin/vehicles" element={<Layout><AdminVehicles /></Layout>} />
              <Route path="/admin/drivers" element={<Layout><AdminDrivers /></Layout>} />
              <Route path="/admin/statistics" element={<Layout><AdminStatistics /></Layout>} />
              <Route path="/admin/backup" element={<Layout><AdminBackup /></Layout>} />
              <Route path="/admin/export-data" element={<Layout><AdminExportData /></Layout>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
