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
import { mockAuthActionResult, mockPatientUser, mockRegisterUser } from '../test/authFixtures';
import {
  mockAlert,
  mockCarePlanDetail,
  mockCarePlanSummary,
  mockConnector,
  mockSnoozeResult,
} from '../test/healthFixtures';
import { ChatPage } from './ChatPage';
import { VoicePage } from './VoicePage';
import { HealthDataPage } from './HealthDataPage';
import { OrganizationSettingsPage } from './OrganizationSettingsPage';

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

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockPatientUser);
    vi.mocked(authService.login).mockResolvedValue({
      access_token: 'new-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: mockPatientUser,
    });
    vi.mocked(authService.changePassword).mockResolvedValue(mockAuthActionResult);
    vi.mocked(authService.register).mockResolvedValue(mockRegisterUser);
    vi.mocked(authService.forgotPassword).mockResolvedValue(mockAuthActionResult);
    vi.mocked(authService.resetPassword).mockResolvedValue(mockAuthActionResult);
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
        'Blood Pressure': {
          value: 120,
          value_string: '120/80',
          unit: 'mmHg',
          effective_date: '2026-01-01',
          source: 'manual',
        },
      },
      alerts: { total_active: 1, completed_today: 0 },
      care_plans: [mockCarePlanSummary],
    });
    vi.mocked(healthDataService.getAlerts).mockResolvedValue({
      patient_id: 'p1',
      date: '2026-01-01',
      count: 1,
      alerts: [mockAlert],
    });
    vi.mocked(healthDataService.completeAlert).mockResolvedValue({
      status: 'ok',
      alert_id: 'alert-1',
      completed_date: '2026-01-01',
    });
    vi.mocked(healthDataService.snoozeAlert).mockResolvedValue(mockSnoozeResult);
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
      care_plans: [mockCarePlanSummary],
    });
    vi.mocked(healthDataService.getCarePlanDetail).mockResolvedValue(mockCarePlanDetail);
    vi.mocked(healthDataService.getPatientData).mockResolvedValue([]);
    vi.mocked(healthDataService.getEncounters).mockResolvedValue([]);
    vi.mocked(healthDataService.getDiagnosticReports).mockResolvedValue([]);

    vi.mocked(connectorService.getConnectors).mockResolvedValue([mockConnector]);
    vi.mocked(connectorService.createConnector).mockResolvedValue({
      ehr_system: 'cerner',
      is_active: true,
      is_authorized: false,
      status: 'pending',
    });
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
    vi.mocked(cairgiverService.approveRequest).mockResolvedValue({ message: 'ok' });
    vi.mocked(cairgiverService.searchPatients).mockResolvedValue([]);
    vi.mocked(cairgiverService.sendPatientRequest).mockResolvedValue({
      relationship_id: 'rel-new',
      message: 'sent',
    });
    vi.mocked(cairgiverService.removeCairgiverConnection).mockResolvedValue({ message: 'removed' });

    vi.mocked(voiceService.getVoiceModels).mockResolvedValue([mockVoiceModel]);
    vi.mocked(voiceService.resolveUserVoiceModel).mockResolvedValue('v1');
    vi.mocked(voiceService.getVoiceSample).mockResolvedValue(new Blob(['audio']));
    vi.mocked(voiceService.updateUserVoiceModel).mockResolvedValue('v1');
  });

  it('dashboard loads summary and opens care plan modal', async () => {
    const user = userEvent.setup();
    renderPage('/dashboard', <DashboardPage />);

    // BP value and its unit render in sibling nodes; assert the combined text
    // has a real space ("120/80 mmHg", not "120/80mmHg") on the <p> itself.
    expect(
      await screen.findByText(
        (_, el) => el?.tagName === 'P' && /\b120\/80\s+mmHg\b/.test(el.textContent || '')
      )
    ).toBeInTheDocument();

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
    const input = await screen.findByPlaceholderText('Type your reply...');
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

    await user.click(screen.getByRole('button', { name: /Authorize/i }));
    await waitFor(() => expect(connectorService.authorizeConnector).toHaveBeenCalledWith('epic'));

    await user.click(screen.getByRole('button', { name: /^Add$/i }));
    expect(await screen.findByText(/Add Connector/i)).toBeInTheDocument();
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
