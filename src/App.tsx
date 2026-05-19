import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';
import { AppLayout } from './components/layout/AppLayout';
import { OrganizationSelectionPage } from './pages/auth/OrganizationSelectionPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VoicePage } from './pages/VoicePage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { TrackersPage } from './pages/trackers/TrackersPage';
import { TrackerDetailPage } from './pages/trackers/TrackerDetailPage';
import { CaregiversPage } from './pages/CaregiversPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/voice" replace />;
  }

  return <>{children}</>;
}

function OrganizationRoute({ children }: { children: React.ReactNode }) {
  const { selectedOrganization, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedOrganization) {
    return <Navigate to="/select-organization" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <OrganizationProvider>
        <AuthProvider>
          <Routes>
            {/* Organization Selection - before login */}
            <Route path="/select-organization" element={<OrganizationSelectionPage />} />
            
            {/* Public Routes - require organization selection */}
            <Route path="/login" element={<OrganizationRoute><PublicRoute><LoginPage /></PublicRoute></OrganizationRoute>} />
            <Route path="/forgot-password" element={<OrganizationRoute><PublicRoute><ForgotPasswordPage /></PublicRoute></OrganizationRoute>} />
            <Route path="/reset-password" element={<OrganizationRoute><PublicRoute><ResetPasswordPage /></PublicRoute></OrganizationRoute>} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/voice" replace />} />
              <Route path="voice" element={<VoicePage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="trackers" element={<TrackersPage />} />
              <Route path="trackers/:trackerId" element={<TrackerDetailPage />} />
              <Route path="caregivers" element={<CaregiversPage />} />
              <Route path="organization-settings" element={<OrganizationSettingsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/select-organization" replace />} />
          </Routes>
        </AuthProvider>
      </OrganizationProvider>
    </BrowserRouter>
  );
}

export default App;
