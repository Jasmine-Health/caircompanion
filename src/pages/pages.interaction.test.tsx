import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { OrganizationProvider } from '../contexts/OrganizationContext';
import * as authService from '../services/authService';
import * as healthDataService from '../services/healthDataService';
import * as connectorService from '../services/connectorService';
import * as cairgiverService from '../services/cairgiverService';
import * as voiceService from '../services/voiceService';

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
    isInstallable: true,
    isInstalled: false,
    install: vi.fn().mockResolvedValue(false),
    showInstructions: false,
    setShowInstructions: vi.fn(),
    platform: 'desktop' as const,
  }),
}));

vi.mock('../services/authService');
vi.mock('../services/healthDataService');
vi.mock('../services/connectorService');
vi.mock('../services/cairgiverService');
vi.mock('../services/organizationService', () => ({
  getOrganizations: vi.fn().mockResolvedValue({
    count: 1,
    organizations: [{ organization_id: 'org-1', name: 'Pulp Digital', logo_url: '/logo.png' }],
  }),
  getMyEnrollments: vi.fn().mockResolvedValue({ enrollments: [] }),
  getCurrentOrganization: vi.fn().mockResolvedValue({ is_set: false }),
  switchOrganization: vi.fn(),
  enrollInOrganization: vi.fn(),
  unenrollFromOrganization: vi.fn(),
}));
vi.mock('../services/voiceService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/voiceService')>();
  return {
    ...actual,
    getVoiceModels: vi.fn(),
    resolveUserVoiceModel: vi.fn(),
    getVoiceSample: vi.fn(),
    updateUserVoiceModel: vi.fn(),
  };
});

import { DashboardPage } from './DashboardPage';
import { AlertsPage } from './AlertsPage';
import { CareStepsPage } from './CareStepsPage';
import { CareNotesPage } from './CareNotesPage';
import { CarePlanPage } from './CarePlanPage';
import { ConnectorsPage } from './ConnectorsPage';
import { CaregiversPage } from './CaregiversPage';
import { SettingsPage } from './SettingsPage';
import { OAuthCallbackPage } from './auth/OAuthCallbackPage';
import { mockVoiceModel } from '../test/voiceModelFixtures';
import { ChatPage } from './ChatPage';
import { VoicePage } from './VoicePage';
import { HealthDataPage } from './HealthDataPage';
import { OrganizationSettingsPage } from './OrganizationSettingsPage';

const patientUser = {
  email: 'joe@example.com',
  first_name: 'Joe',
  last_name: 'Example',
  is_active: true,
  agreed_to_sms: false,
  role: 'patient' as const,
  timezone: 'UTC',
  createdAt: '',
  updatedAt: '',
};

const sampleAlert = {
  id: 'alert-1',
  type: 'medication' as const,
  title: 'Morning medication',
  description: 'Take with food',
  time: ['08:00'],
  is_completed_today: false,
  completed_dates: [] as string[],
};

function renderPage(path: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <OrganizationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/oauth/callback" element={element} />
            <Route path="/reset-password" element={element} />
            <Route path="*" element={element} />
          </Routes>
        </AuthProvider>
      </OrganizationProvider>
    </MemoryRouter>
  );
}

describe('page interactions', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'token-123');
    localStorage.setItem(
      'selectedOrganization',
      JSON.stringify({ id: 'org-1', name: 'Pulp Digital', logo: '/logo.png' })
    );

    vi.mocked(authService.getCurrentUser).mockResolvedValue(patientUser);
    vi.mocked(authService.login).mockResolvedValue({
      access_token: 'new-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: patientUser,
    });
    vi.mocked(authService.changePassword).mockResolvedValue(undefined);
    vi.mocked(authService.register).mockResolvedValue({
      access_token: 'reg-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: patientUser,
    });
    vi.mocked(authService.forgotPassword).mockResolvedValue(undefined);
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined);
    vi.mocked(authService.getGoogleAuthUrl).mockResolvedValue({
      authorization_url: 'https://auth.example/google',
      state: 's',
    });
    vi.mocked(authService.getEntraAuthUrl).mockResolvedValue({
      authorization_url: 'https://auth.example/entra',
      state: 's2',
    });

    vi.mocked(healthDataService.getDailySummary).mockResolvedValue({
      patient_id: 'p1',
      first_name: 'Joe',
      last_name: 'Example',
      date_of_birth: '1990-01-01',
      language: 'en',
      conditions: ['Hypertension'],
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', timing: 'Morning', instructions: 'With food' },
      ],
      allergies: ['Penicillin'],
      recent_vitals: {
        'Blood Pressure': { value: '120/80', unit: 'mmHg', date: '2026-01-01' },
      },
      alerts: { total_active: 1, completed_today: 0 },
      care_plans: [{ plan_id: 'plan-1', name: 'Recovery Plan', status: 'active', type: 'general' }],
    });
    vi.mocked(healthDataService.getAlerts).mockResolvedValue({
      patient_id: 'p1',
      date: '2026-01-01',
      count: 1,
      alerts: [sampleAlert],
    });
    vi.mocked(healthDataService.completeAlert).mockResolvedValue({
      status: 'ok',
      alert_id: 'alert-1',
      completed_date: '2026-01-01',
    });
    vi.mocked(healthDataService.snoozeAlert).mockResolvedValue({
      alert_id: 'alert-1',
      snoozed_until: '2026-01-01T09:15:00Z',
    });
    vi.mocked(healthDataService.getCareSteps).mockResolvedValue([
      {
        step_id: 'seed_daily_plan_w1_s1',
        label: 'Step',
        status: 'pending',
        due_date: new Date().toISOString(),
        pathway_name: 'HF',
      },
    ]);
    vi.mocked(healthDataService.completeCareStep).mockResolvedValue(undefined);
    vi.mocked(healthDataService.getCareTeamNotes).mockResolvedValue({
      patient_id: 'p1',
      physician_instructions: [
        { id: 'pi-1', message: 'Rest', from: 'Dr. Smith', priority: 'normal', date: '2026-01-01', status: 'active' },
      ],
      nurse_questions: [
        {
          id: 'nq-1',
          conversation_id: 'conv-1',
          message: 'How are you feeling?',
          date: '2026-01-01T10:00:00Z',
          replied: false,
          reply_text: null,
          care_team_response: null,
          reply_date: null,
        },
      ],
      caregiver_notifications: [],
    });
    vi.mocked(healthDataService.replyToNurseQuestion).mockResolvedValue({ response: 'Thanks for checking in' });
    vi.mocked(healthDataService.getCarePlans).mockResolvedValue({
      patient_id: 'p1',
      count: 1,
      care_plans: [{ plan_id: 'plan-1', name: 'Recovery Plan', status: 'active', type: 'general', phase: '1' }],
    });
    vi.mocked(healthDataService.getCarePlanDetail).mockResolvedValue({
      plan_id: 'plan-1',
      name: 'Recovery Plan',
      description: 'Follow daily steps',
      type: 'general',
      phase: '1',
      status: 'active',
      plan_type: 'care',
      activities: ['Walk 10 minutes'],
      instructions: [{ section_type: 'note', title: 'Note', content: 'Hydrate well' }],
      steps: [
        {
          step_id: 's1',
          label: 'Morning walk',
          status: 'pending',
          due_date: '2026-01-01',
          description: 'Easy pace',
          type: 'exercise',
          priority: 'medium',
        },
      ],
      patient_context: {
        medications: [{ name: 'Med A', dosage: '5mg', frequency: 'Daily', timing: 'AM', instructions: '' }],
        monitoring: [{ name: 'Weight', value_string: '180 lbs', effective_date: '2026-01-01' }],
        conditions: [{ title: 'HF', code: 'I50' }],
        allergies: ['Sulfa'],
      },
    });
    vi.mocked(healthDataService.getPatientData).mockResolvedValue([]);
    vi.mocked(healthDataService.getEncounters).mockResolvedValue([]);
    vi.mocked(healthDataService.getDiagnosticReports).mockResolvedValue([]);

    vi.mocked(connectorService.getConnectors).mockResolvedValue([
      { ehr_system: 'epic', is_active: true, last_sync: null, status: 'connected' },
    ]);
    vi.mocked(connectorService.createConnector).mockResolvedValue(undefined);
    vi.mocked(connectorService.deleteConnector).mockResolvedValue(undefined);
    vi.mocked(connectorService.authorizeConnector).mockResolvedValue({ authorization_url: 'https://ehr/auth' });

    vi.mocked(cairgiverService.getCairgivers).mockResolvedValue([
      {
        relationship_id: 'rel-1',
        cairgiver_email: 'care@example.com',
        cairgiver_name: 'Care Friend',
        status: 'approved',
        initiator: 'patient',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]);
    vi.mocked(cairgiverService.getPendingRequests).mockResolvedValue([
      {
        relationship_id: 'rel-pending',
        email: 'pending@example.com',
        name: 'Pending Person',
        role: 'cairgiver',
        initiator: 'cairgiver',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]);
    vi.mocked(cairgiverService.approveRequest).mockResolvedValue(undefined);
    vi.mocked(cairgiverService.searchPatients).mockResolvedValue([]);
    vi.mocked(cairgiverService.sendPatientRequest).mockResolvedValue(undefined);
    vi.mocked(cairgiverService.removeCairgiverConnection).mockResolvedValue(undefined);

    vi.mocked(voiceService.getVoiceModels).mockResolvedValue([mockVoiceModel]);
    vi.mocked(voiceService.resolveUserVoiceModel).mockResolvedValue('v1');
    vi.mocked(voiceService.getVoiceSample).mockResolvedValue(new Blob(['audio']));
    vi.mocked(voiceService.updateUserVoiceModel).mockResolvedValue('v1');
  });

  it('dashboard loads summary and opens care plan modal', async () => {
    const user = userEvent.setup();
    renderPage('/dashboard', <DashboardPage />);

    await user.click(await screen.findByRole('button', { name: /Recovery Plan/i }));
    await waitFor(() => expect(healthDataService.getCarePlanDetail).toHaveBeenCalledWith('plan-1'));
  });

  it('alerts page completes and snoozes alerts', async () => {
    const user = userEvent.setup();
    renderPage('/alerts', <AlertsPage />);

    expect(await screen.findByText('Morning medication')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /^Snooze$/i })[0]);
    expect(await screen.findByText('Snooze Alert')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /^Snooze$/i })[1]);
    await waitFor(() => expect(healthDataService.snoozeAlert).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /^Complete$/i }));
    await waitFor(() => expect(healthDataService.completeAlert).toHaveBeenCalled());
  });

  it('care steps page shows error when load fails', async () => {
    vi.mocked(healthDataService.getCareSteps).mockRejectedValueOnce(new Error('fail'));
    renderPage('/care-steps', <CareStepsPage />);
    expect(await screen.findByText(/Could not load care steps/i)).toBeInTheDocument();
  });

  it('care steps page marks a step complete', async () => {
    const user = userEvent.setup();
    renderPage('/care-steps', <CareStepsPage />);

    expect(await screen.findByText(/Take medications/i)).toBeInTheDocument();
    const doneButton = screen.getByRole('button', { name: /^Complete$/i });
    await user.click(doneButton);
    await waitFor(() => expect(healthDataService.completeCareStep).toHaveBeenCalled());
  });

  it('care notes page submits nurse reply', async () => {
    const user = userEvent.setup();
    renderPage('/care-notes', <CareNotesPage />);

    expect(await screen.findByText('How are you feeling?')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Type your reply...');
    await user.type(input, 'Feeling better');
    await user.click(screen.getByRole('button', { name: /^Reply$/i }));
    await waitFor(() =>
      expect(healthDataService.replyToNurseQuestion).toHaveBeenCalledWith('conv-1', 'Feeling better')
    );
  });

  it('care plan page opens detail modal', async () => {
    const user = userEvent.setup();
    const view = renderPage('/care-plan', <CarePlanPage />);
    const page = within(view.container);

    expect(await page.findByText('Recovery Plan')).toBeInTheDocument();
    await user.click(page.getByRole('button', { name: /Recovery Plan/i }));
    await waitFor(() => expect(healthDataService.getCarePlanDetail).toHaveBeenCalled());
  });

  it('connectors page supports add and authorize flows', async () => {
    const user = userEvent.setup();
    renderPage('/connectors', <ConnectorsPage />);

    expect(await screen.findByText(/epic/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Add|Connect/i }));
    const addDialog = await screen.findByText(/Select EHR|Add connector/i);
    expect(addDialog).toBeInTheDocument();

    const authorize = screen.getByRole('button', { name: /Authorize/i });
    await user.click(authorize);
    await waitFor(() => expect(connectorService.authorizeConnector).toHaveBeenCalledWith('epic'));
  });

  it('caregivers page shows list and invite form', async () => {
    const user = userEvent.setup();
    renderPage('/caregivers', <CaregiversPage />);

    expect(await screen.findByText('Care Friend')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /Invite/i })[0]);
    expect(await screen.findByPlaceholderText('caregiver@example.com')).toBeInTheDocument();
  });

  it('settings page opens password and voice preferences', async () => {
    const user = userEvent.setup();
    renderPage('/settings', <SettingsPage />);

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Change Password/i }));
    expect(await screen.findByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Voice Model/i }));
    expect(await screen.findByRole('heading', { name: 'Assistant Voice' })).toBeInTheDocument();
    expect(screen.getAllByText('Voice One').length).toBeGreaterThan(0);
  });

  it('oauth callback stores token and user session', async () => {
    const search =
      '?access_token=oauth-token&user_email=joe@example.com&user_name=Joe%20Example&role=patient';
    render(
      <MemoryRouter initialEntries={[{ pathname: '/oauth-callback', search }]}>
        <OrganizationProvider>
          <AuthProvider>
            <Routes>
              <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
              <Route path="/voice" element={<div data-testid="voice-redirect" />} />
            </Routes>
          </AuthProvider>
        </OrganizationProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(localStorage.getItem('access_token')).toBe('oauth-token'));
  });

  it('chat page renders message input', async () => {
    renderPage('/chat', <ChatPage />);
    expect(await screen.findByPlaceholderText('Message CairCompanion...')).toBeInTheDocument();
  });

  it('voice page renders speak control', async () => {
    renderPage('/voice', <VoicePage />);
    expect(screen.getAllByText(/Talk to CairCompanion|Tap to speak/i).length).toBeGreaterThan(0);
  });

  it('health data page loads', async () => {
    renderPage('/health-data', <HealthDataPage />);
    expect(await screen.findByRole('heading', { name: /Health Data/i })).toBeInTheDocument();
  });

  it('organization settings page loads', async () => {
    renderPage('/organizations', <OrganizationSettingsPage />);
    expect(await screen.findByRole('heading', { name: /Organization Settings/i })).toBeInTheDocument();
  });
});
