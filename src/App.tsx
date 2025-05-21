
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/context/theme-provider'
import { AuthProvider } from '@/context/auth-context'
import { LanguageProvider } from '@/context/language-context'
import { Layout } from '@/components/layout/layout'

import Login from '@/pages/auth/Login'
import NotFound from '@/pages/NotFound'

// Admin routes
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminCredentials from '@/pages/admin/AdminCredentials'
import AdminDrivers from '@/pages/admin/AdminDrivers'
import AdminVehicles from '@/pages/admin/AdminVehicles'
import AdminStatistics from '@/pages/admin/AdminStatistics'
import AdminBackup from '@/pages/admin/AdminBackup'

// Leader routes
import LeaderDashboard from '@/pages/leader/LeaderDashboard'
import LeaderCreateProject from '@/pages/leader/LeaderCreateProject'
import LeaderAddProgress from '@/pages/leader/LeaderAddProgress'
import LeaderViewProgress from '@/pages/leader/LeaderViewProgress'
import LeaderRequestPayment from '@/pages/leader/LeaderRequestPayment'
import LeaderViewPayment from '@/pages/leader/LeaderViewPayment'

// Checker routes
import CheckerDashboard from '@/pages/checker/CheckerDashboard'
import CheckerReviewSubmissions from '@/pages/checker/CheckerReviewSubmissions'
import CheckerReviewHistory from '@/pages/checker/CheckerReviewHistory'
import CheckerProjects from '@/pages/checker/CheckerProjects'

// Owner routes
import OwnerDashboard from '@/pages/owner/OwnerDashboard'
import OwnerPaymentQueue from '@/pages/owner/OwnerPaymentQueue'
import OwnerProjects from '@/pages/owner/OwnerProjects'
import OwnerStatistics from '@/pages/owner/OwnerStatistics'
import OwnerBackup from '@/pages/owner/OwnerBackup'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/credentials" element={<AdminCredentials />} />
              <Route path="/admin/drivers" element={<AdminDrivers />} />
              <Route path="/admin/vehicles" element={<AdminVehicles />} />
              <Route path="/admin/statistics" element={<AdminStatistics />} />
              <Route path="/admin/backup" element={<AdminBackup />} />
              
              {/* Leader routes */}
              <Route path="/leader" element={<LeaderDashboard />} />
              <Route path="/leader/create-project" element={<LeaderCreateProject />} />
              <Route path="/leader/add-progress" element={<LeaderAddProgress />} />
              <Route path="/leader/view-progress" element={<LeaderViewProgress />} />
              <Route path="/leader/request-payment" element={<LeaderRequestPayment />} />
              <Route path="/leader/view-payment" element={<LeaderViewPayment />} />
              
              {/* Checker routes */}
              <Route path="/checker" element={<CheckerDashboard />} />
              <Route path="/checker/review-submissions" element={<CheckerReviewSubmissions />} />
              <Route path="/checker/review-history" element={<CheckerReviewHistory />} />
              <Route path="/checker/projects" element={<CheckerProjects />} />
              
              {/* Owner routes */}
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/owner/payment-queue" element={<OwnerPaymentQueue />} />
              <Route path="/owner/projects" element={<OwnerProjects />} />
              <Route path="/owner/statistics" element={<OwnerStatistics />} />
              <Route path="/owner/backup" element={<OwnerBackup />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="bottom-right" />
          </Layout>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
