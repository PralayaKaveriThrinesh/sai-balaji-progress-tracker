import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth-context';
import Layout from './components/layout/layout';
import Login from './pages/auth/Login';
import LeaderDashboard from './pages/leader/LeaderDashboard';
import LeaderCreateProject from './pages/leader/LeaderCreateProject';
import LeaderAddProgress from './pages/leader/LeaderAddProgress';
import LeaderViewPayment from './pages/leader/LeaderViewPayment';
import LeaderRequestPayment from './pages/leader/LeaderRequestPayment';
import CheckerReviewSubmissions from './pages/checker/CheckerReviewSubmissions';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminStatistics from './pages/admin/AdminStatistics';
import AdminCredentials from './pages/admin/AdminCredentials';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerProjects from './pages/owner/OwnerProjects';
import OwnerStatistics from './pages/owner/OwnerStatistics';
import OwnerPaymentQueue from './pages/owner/OwnerPaymentQueue';
import AdminBackup from './pages/admin/AdminBackup';
import OwnerBackup from './pages/owner/OwnerBackup';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== role) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Leader Routes */}
          <Route path="/leader" element={
            <ProtectedRoute role="leader">
              <Layout>
                <LeaderDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/leader/create-project" element={
            <ProtectedRoute role="leader">
              <Layout>
                <LeaderCreateProject />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/leader/add-progress" element={
            <ProtectedRoute role="leader">
              <Layout>
                <LeaderAddProgress />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/leader/view-payment" element={
            <ProtectedRoute role="leader">
              <Layout>
                <LeaderViewPayment />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/leader/request-payment" element={
            <ProtectedRoute role="leader">
              <Layout>
                <LeaderRequestPayment />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Checker Routes */}
          <Route path="/checker" element={
            <ProtectedRoute role="checker">
              <Layout>
                <CheckerReviewSubmissions />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/vehicles" element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminVehicles />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/drivers" element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminDrivers />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/statistics" element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminStatistics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/credentials" element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminCredentials />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/backup" element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminBackup />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Owner Routes */}
          <Route path="/owner" element={
            <ProtectedRoute role="owner">
              <Layout>
                <OwnerDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/owner/projects" element={
            <ProtectedRoute role="owner">
              <Layout>
                <OwnerProjects />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/owner/statistics" element={
            <ProtectedRoute role="owner">
              <Layout>
                <OwnerStatistics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/owner/payment-queue" element={
            <ProtectedRoute role="owner">
              <Layout>
                <OwnerPaymentQueue />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/owner/backup" element={
            <ProtectedRoute role="owner">
              <Layout>
                <OwnerBackup />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
