import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';
import { AppLayout } from './components/layout/AppLayout';
import { OrganizationSelectionPage } from './pages/auth/OrganizationSelectionPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { OAuthCallbackPage } from './pages/auth/OAuthCallbackPage';
import { VoicePage } from './pages/VoicePage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { AlertsPage, AppointmentsPage } from './pages/AlertsPage';
import { MedicationsPage, ExercisePage, MoodPage, DietPage } from './pages/TrackerPages';
import { CarePlanPage } from './pages/CarePlanPage';
import { HealthDataPage } from './pages/HealthDataPage';
import { ConnectorsPage } from './pages/ConnectorsPage';
import { TrackersPage } from './pages/trackers/TrackersPage';
import { TrackerDetailPage } from './pages/trackers/TrackerDetailPage';
import { CaregiversPage } from './pages/CaregiversPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
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
      <div className="h-screen flex items-center justify-center bg-gray-50">
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
      <div className="h-screen flex items-center justify-center bg-gray-50">
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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <OrganizationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/select-organization" element={<OrganizationSelectionPage />} />

            <Route path="/login" element={<OrganizationRoute><PublicRoute><LoginPage /></PublicRoute></OrganizationRoute>} />
            <Route path="/register" element={<OrganizationRoute><PublicRoute><RegisterPage /></PublicRoute></OrganizationRoute>} />
            <Route path="/forgot-password" element={<OrganizationRoute><PublicRoute><ForgotPasswordPage /></PublicRoute></OrganizationRoute>} />
            <Route path="/reset-password" element={<OrganizationRoute><PublicRoute><ResetPasswordPage /></PublicRoute></OrganizationRoute>} />
            <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/voice" replace />} />

              {/* Voice & Chat - unchanged */}
              <Route path="voice" element={<VoicePage />} />
              <Route path="chat" element={<ChatPage />} />

              {/* iOS bottom tab screens */}
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="medications" element={<MedicationsPage />} />
              <Route path="care-plan" element={<CarePlanPage />} />

              {/* Drawer menu screens */}
              <Route path="health-data" element={<HealthDataPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="exercise" element={<ExercisePage />} />
              <Route path="mood" element={<MoodPage />} />
              <Route path="diet" element={<DietPage />} />
              <Route path="connectors" element={<ConnectorsPage />} />
              <Route path="caregivers" element={<CaregiversPage />} />
              <Route path="organizations" element={<OrganizationSettingsPage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Legacy routes kept for compatibility */}
              <Route path="trackers" element={<TrackersPage />} />
              <Route path="trackers/:trackerId" element={<TrackerDetailPage />} />
              <Route path="organization-settings" element={<Navigate to="/organizations" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/select-organization" replace />} />
          </Routes>
        </AuthProvider>
      </OrganizationProvider>
    </BrowserRouter>
  );
}

export default App;
