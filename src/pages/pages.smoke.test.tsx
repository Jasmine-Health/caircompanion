import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { OrganizationProvider } from '../contexts/OrganizationContext';

vi.mock('framer-motion', () => {
  const Motion = ({ children, ...props }: { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );
  return {
    motion: new Proxy(
      {},
      {
        get: () => Motion,
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../hooks/useVoiceChat', () => ({
  useVoiceChat: () => ({
    status: 'ready',
    transcript: 'Hello',
    transcriptSpeaker: 'assistant' as const,
    startConversation: vi.fn(),
    stopConversation: vi.fn(),
    error: null,
  }),
}));

vi.mock('../hooks/usePWAInstall', () => ({
  usePWAInstall: () => ({
    isInstallable: false,
    isInstalled: false,
    install: vi.fn(),
    showInstructions: false,
    setShowInstructions: vi.fn(),
    platform: 'desktop' as const,
  }),
}));

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn().mockRejectedValue(new Error('no session')),
  updateTimezone: vi.fn(),
  getGoogleAuthUrl: vi.fn(),
  getEntraAuthUrl: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyResetToken: vi.fn(),
}));

vi.mock('../services/organizationService', () => ({
  getOrganizations: vi.fn().mockResolvedValue({
    count: 1,
    organizations: [{ organization_id: 'org-1', name: 'Pulp Digital', logo_url: '/logo.png' }],
  }),
  getMyEnrollments: vi.fn(),
  getCurrentOrganization: vi.fn(),
  switchOrganization: vi.fn(),
  enrollInOrganization: vi.fn(),
  unenrollFromOrganization: vi.fn(),
}));

vi.mock('../services/healthDataService', () => ({
  getDailySummary: vi.fn().mockResolvedValue({
    patient_id: 'p1',
    first_name: 'Joe',
    last_name: 'Example',
    date_of_birth: '1990-01-01',
    language: 'en',
    conditions: [],
    medications: [],
    allergies: [],
    recent_vitals: {},
    alerts: { total_active: 0, completed_today: 0 },
    care_plans: [],
  }),
  getAlerts: vi.fn().mockResolvedValue({ patient_id: 'p1', date: '2026-01-01', count: 0, alerts: [] }),
  completeAlert: vi.fn(),
  snoozeAlert: vi.fn(),
  getCarePlans: vi.fn().mockResolvedValue({ patient_id: 'p1', count: 0, care_plans: [] }),
  getCarePlanDetail: vi.fn().mockResolvedValue({
    plan_id: 'plan-1',
    name: 'Plan',
    description: null,
    type: 'general',
    phase: '1',
    status: 'active',
    plan_type: 'care',
    activities: [],
    instructions: [],
  }),
  getVitals: vi.fn().mockResolvedValue({ patient_id: 'p1', type: 'x', count: 0, observations: [] }),
  getMedications: vi.fn().mockResolvedValue({ patient_id: 'p1', type: 'x', count: 0, observations: [] }),
  getExercise: vi.fn().mockResolvedValue({ patient_id: 'p1', type: 'x', count: 0, observations: [] }),
  getDiet: vi.fn().mockResolvedValue({ patient_id: 'p1', type: 'x', count: 0, observations: [] }),
  getSleep: vi.fn().mockResolvedValue({ patient_id: 'p1', type: 'x', count: 0, observations: [] }),
  getMood: vi.fn().mockResolvedValue({ patient_id: 'p1', type: 'x', count: 0, observations: [] }),
  getTrackersSummary: vi.fn().mockResolvedValue({
    patient_id: 'p1',
    date: '2026-01-01',
    summary: {
      vital: { count: 0, entries: [] },
      medication_event: { count: 0, entries: [] },
      exercise: { count: 0, entries: [] },
      diet: { count: 0, entries: [] },
      sleep: { count: 0, entries: [] },
      mood: { count: 0, entries: [] },
    },
  }),
  getPatientData: vi.fn().mockResolvedValue([]),
  getEncounters: vi.fn().mockResolvedValue([]),
  getDiagnosticReports: vi.fn().mockResolvedValue([]),
}));

vi.mock('../services/connectorService', () => ({
  getConnectors: vi.fn().mockResolvedValue([]),
  createConnector: vi.fn(),
  deleteConnector: vi.fn(),
  authorizeConnector: vi.fn(),
}));

vi.mock('../services/cairgiverService', () => ({
  getCairgivers: vi.fn().mockResolvedValue([]),
  getPatients: vi.fn().mockResolvedValue([]),
  getPendingRequests: vi.fn().mockResolvedValue([]),
  searchPatients: vi.fn().mockResolvedValue([]),
  sendPatientRequest: vi.fn(),
  removeCairgiverConnection: vi.fn(),
}));

import { VoicePage } from './VoicePage';
import { ChatPage } from './ChatPage';
import { DashboardPage } from './DashboardPage';
import { AlertsPage } from './AlertsPage';
import { CarePlanPage } from './CarePlanPage';
import { MedicationsPage, ExercisePage, MoodPage, DietPage } from './TrackerPages';
import { HealthDataPage } from './HealthDataPage';
import { ConnectorsPage } from './ConnectorsPage';
import { TrackersPage } from './trackers/TrackersPage';
import { TrackerDetailPage } from './trackers/TrackerDetailPage';
import { CaregiversPage } from './CaregiversPage';
import { SettingsPage } from './SettingsPage';
import { OrganizationSettingsPage } from './OrganizationSettingsPage';
import { LoginPage } from './auth/LoginPage';
import { OrganizationSelectionPage } from './auth/OrganizationSelectionPage';
import { ForgotPasswordPage } from './auth/ForgotPasswordPage';
import { RegisterPage } from './auth/RegisterPage';

function renderPage(path: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <OrganizationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/trackers/:trackerId" element={element} />
            <Route path="*" element={element} />
          </Routes>
        </AuthProvider>
      </OrganizationProvider>
    </MemoryRouter>
  );
}

describe('page smoke tests', () => {
  beforeEach(() => {
    localStorage.setItem(
      'selectedOrganization',
      JSON.stringify({ id: 'org-1', name: 'Pulp Digital', logo: '/logo.png' })
    );
  });

  it('renders primary app pages', async () => {
    const pages: Array<[string, React.ReactElement, RegExp | string]> = [
      ['/voice', <VoicePage />, /Talk to CairCompanion|Tap to speak/i],
      ['/chat', <ChatPage />, /Message your health companion|Chat/i],
      ['/dashboard', <DashboardPage />, /Dashboard|health/i],
      ['/alerts', <AlertsPage />, /Alerts|No Alerts/i],
      ['/care-plan', <CarePlanPage />, /Care Plans|No care plans/i],
      ['/medications', <MedicationsPage />, /Medications/i],
      ['/exercise', <ExercisePage />, /Exercise/i],
      ['/mood', <MoodPage />, /Mood/i],
      ['/diet', <DietPage />, /Diet/i],
      ['/health-data', <HealthDataPage />, /Health Data/i],
      ['/connectors', <ConnectorsPage />, /Connectors/i],
      ['/trackers', <TrackersPage />, /Health Trackers|Trackers/i],
      ['/trackers/vitals', <TrackerDetailPage />, /Vitals|Tracker/i],
      ['/caregivers', <CaregiversPage />, /Cairgiver|Connect/i],
      ['/settings', <SettingsPage />, /Settings/i],
      ['/organizations', <OrganizationSettingsPage />, /Organizations/i],
    ];

    for (const [path, element, matcher] of pages) {
      const { unmount } = renderPage(path, element);
      await waitFor(
        () => expect(screen.getAllByText(matcher).length).toBeGreaterThan(0),
        { timeout: 3000 }
      );
      unmount();
    }
  });

  it('renders auth pages', async () => {
    const org = renderPage('/', <OrganizationSelectionPage />);
    expect(await screen.findByText(/Welcome to CairCompanion/i)).toBeInTheDocument();
    org.unmount();

    const login = renderPage('/', <LoginPage />);
    expect(await screen.findByDisplayValue('joe@example.com')).toBeInTheDocument();
    login.unmount();

    const forgot = renderPage('/', <ForgotPasswordPage />);
    expect(await screen.findByText(/Forgot Password/i)).toBeInTheDocument();
    forgot.unmount();

    renderPage('/', <RegisterPage />);
    expect(await screen.findByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
  });
});
