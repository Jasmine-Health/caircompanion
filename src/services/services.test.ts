import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAPI, fetchAPIWithFormData, API_CONFIG, APIError } from '../config/api';
import * as authService from './authService';
import * as cairgiverService from './cairgiverService';
import * as connectorService from './connectorService';
import * as healthDataService from './healthDataService';
import * as organizationService from './organizationService';
import * as voiceService from './voiceService';

vi.mock('../config/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/api')>();
  return {
    ...actual,
    fetchAPI: vi.fn(),
    fetchAPIWithFormData: vi.fn(),
  };
});

const mockFetchAPI = vi.mocked(fetchAPI);
const mockFetchAPIWithFormData = vi.mocked(fetchAPIWithFormData);

describe('service layer', () => {
  beforeEach(() => {
    mockFetchAPI.mockReset();
    mockFetchAPIWithFormData.mockReset();
    mockFetchAPI.mockResolvedValue({} as never);
    mockFetchAPIWithFormData.mockResolvedValue({} as never);
  });

  it('organizationService calls expected endpoints', async () => {
    await organizationService.getOrganizations();
    await organizationService.enrollInOrganization('org-1');
    await organizationService.getMyEnrollments();
    await organizationService.switchOrganization('org-1');
    await organizationService.getCurrentOrganization();
    await organizationService.unenrollFromOrganization('org-1');

    expect(mockFetchAPI).toHaveBeenCalledWith('/organizations');
    expect(mockFetchAPI).toHaveBeenCalledWith('/organizations/enroll', expect.any(Object));
    expect(mockFetchAPI).toHaveBeenCalledWith('/organizations/my-enrollments');
    expect(mockFetchAPI).toHaveBeenCalledWith('/organizations/switch', expect.any(Object));
    expect(mockFetchAPI).toHaveBeenCalledWith('/organizations/current');
    expect(mockFetchAPI).toHaveBeenCalledWith('/organizations/unenroll/org-1', expect.any(Object));
  });

  it('connectorService calls expected endpoints', async () => {
    await connectorService.getConnectors();
    await connectorService.createConnector({ ehr_system: 'epic', is_active: true });
    await connectorService.deleteConnector('epic');
    await connectorService.authorizeConnector('epic');

    expect(mockFetchAPI).toHaveBeenCalledWith('/connectors/');
    expect(mockFetchAPI).toHaveBeenCalledWith('/connectors/', expect.objectContaining({ method: 'POST' }));
    expect(mockFetchAPI).toHaveBeenCalledWith('/connectors/epic', expect.objectContaining({ method: 'DELETE' }));
    expect(mockFetchAPI).toHaveBeenCalledWith('/connectors/epic/authorize', expect.any(Object));
  });

  it('authService uses form and json endpoints', async () => {
    await authService.login({ email: 'joe@example.com', password: 'secret', role: 'patient' });
    await authService.register({
      email: 'joe@example.com',
      password: 'secret',
      first_name: 'Joe',
      last_name: 'Example',
    });
    await authService.getCurrentUser();
    await authService.changePassword({ old_password: 'a', new_password: 'b' });
    await authService.forgotPassword({ email: 'joe@example.com', role: 'patient' });
    await authService.resetPassword({ token: 't', new_password: 'b' });
    await authService.verifyResetToken({ reset_token: 't' });
    await authService.refreshToken();
    await authService.appleAuthCallback({ identity_token: 'id' });
    await authService.updateTimezone('America/New_York');

    expect(mockFetchAPIWithFormData).toHaveBeenCalled();
    expect(mockFetchAPI).toHaveBeenCalledWith('/auth/me');
    expect(mockFetchAPI).toHaveBeenCalledWith('/auth/refresh', expect.objectContaining({ method: 'POST' }));
  });

  it('authService social auth and delete account use fetch directly', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ authorization_url: 'g', state: 's' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ authorization_url: 'm', state: 's2' }),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    );

    const google = await authService.getGoogleAuthUrl('patient', 'org-1');
    const entra = await authService.getEntraAuthUrl('patient');
    await authService.deleteAccount(true);

    expect(google.authorization_url).toBe('g');
    expect(entra.authorization_url).toBe('m');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/account'),
      expect.objectContaining({ method: 'DELETE' })
    );
    vi.unstubAllGlobals();
  });

  it('cairgiverService builds query params and posts actions', async () => {
    await cairgiverService.getPatients('approved');
    await cairgiverService.getPatientDetail('p@example.com');
    await cairgiverService.getPendingRequests();
    await cairgiverService.approveRequest('rel-1', 'approved');
    await cairgiverService.cancelRequest('rel-1');
    await cairgiverService.getCairgivers('pending');
    await cairgiverService.getCairgiverDetail('cg@example.com');
    await cairgiverService.searchPatients('joe');
    await cairgiverService.sendPatientRequest('cg@example.com');
    await cairgiverService.removePatientConnection('rel-1');
    await cairgiverService.removeCairgiverConnection('rel-1');
    await cairgiverService.sendCairgiverRequest('p@example.com');

    expect(mockFetchAPI).toHaveBeenCalledWith('/cairgiver/patients?status_filter=approved');
    expect(mockFetchAPI).toHaveBeenCalledWith('/cairgiver/patients/p@example.com');
    expect(mockFetchAPI).toHaveBeenCalledWith('/cairgiver/patient-list?email=joe');
  });

  it('healthDataService passes patient email headers and query params', async () => {
    await healthDataService.getDailySummary('2026-01-01', 'p@example.com');
    await healthDataService.getAlerts({ date: '2026-01-01', type: 'medication', is_active: true }, 'p@example.com');
    await healthDataService.completeAlert('a1', '2026-01-01');
    await healthDataService.snoozeAlert('a1', 15);
    await healthDataService.getCarePlans('p@example.com');
    await healthDataService.getCarePlanDetail('plan-1', 'p@example.com');
    await healthDataService.getVitals({ start_date: '2026-01-01', source: 'device' }, 'p@example.com');
    await healthDataService.getMedications({ start_date: '2026-01-01' }, 'p@example.com');
    await healthDataService.getExercise({ start_date: '2026-01-01' }, 'p@example.com');
    await healthDataService.getDiet({ start_date: '2026-01-01' }, 'p@example.com');
    await healthDataService.getSleep({ start_date: '2026-01-01' }, 'p@example.com');
    await healthDataService.getMood({ start_date: '2026-01-01' }, 'p@example.com');
    await healthDataService.getTrackersSummary('2026-01-01', 'p@example.com');
    await healthDataService.getPatientData();
    await healthDataService.getEncounters();
    await healthDataService.getDiagnosticReports();

    expect(mockFetchAPI).toHaveBeenCalledWith(
      expect.stringContaining('/summary?date=2026-01-01'),
      expect.objectContaining({ headers: { 'X-Patient-Email': 'p@example.com' } })
    );
    expect(mockFetchAPI).toHaveBeenCalledWith(
      '/alerts_v2?date=2026-01-01&type=medication&is_active=true',
      expect.objectContaining({ headers: { 'X-Patient-Email': 'p@example.com' } })
    );
    expect(mockFetchAPI).toHaveBeenCalledWith('/collections/Patient');
  });

  it('voiceService loads models and voice sample blob', async () => {
    mockFetchAPI.mockResolvedValueOnce({ voice_models: [{ id: 'v1', name: 'Voice 1' }] });
    const models = await voiceService.getVoiceModels();
    expect(models).toHaveLength(1);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['audio']),
      })
    );
    const blob = await voiceService.getVoiceSample('v1');
    expect(blob).toBeInstanceOf(Blob);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_CONFIG.BASE_URL}/voice/sample?model=v1`),
      expect.any(Object)
    );
    vi.unstubAllGlobals();
  });

  it('authService propagates entra and delete account failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ detail: 'fail' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ message: 'cannot delete' }),
        })
    );
    await expect(authService.getEntraAuthUrl()).rejects.toBeInstanceOf(APIError);
    await expect(authService.deleteAccount(false)).rejects.toBeInstanceOf(APIError);
    vi.unstubAllGlobals();
  });

  it('authService propagates social auth failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'fail' }),
      })
    );
    await expect(authService.getGoogleAuthUrl()).rejects.toBeInstanceOf(APIError);
    vi.unstubAllGlobals();
  });

  it('voiceService throws when sample request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'missing model' }),
      })
    );
    await expect(voiceService.getVoiceSample('bad')).rejects.toThrow('missing model');
    vi.unstubAllGlobals();
  });

  it('voiceService caches model in localStorage', () => {
    voiceService.cacheVoiceModel('custom-voice');
    expect(voiceService.getCachedVoiceModel()).toBe('custom-voice');
    voiceService.clearCachedVoiceModel();
    expect(voiceService.getCachedVoiceModel()).toBe(voiceService.DEFAULT_VOICE_MODEL);
  });

  it('voiceService reads and updates user voice settings', async () => {
    mockFetchAPI.mockResolvedValueOnce({ voice_model: 'saved-voice' });
    expect(await voiceService.getUserVoiceSettings()).toBe('saved-voice');

    mockFetchAPI.mockResolvedValueOnce({ voice_model: 'updated-voice' });
    const saved = await voiceService.updateUserVoiceModel('updated-voice');
    expect(saved).toBe('updated-voice');
    expect(voiceService.getCachedVoiceModel()).toBe('updated-voice');
  });

  it('resolveUserVoiceModel uses saved server voice', async () => {
    mockFetchAPI.mockResolvedValueOnce({ voice_model: 'server-voice' });
    const model = await voiceService.resolveUserVoiceModel();
    expect(model).toBe('server-voice');
    expect(voiceService.getCachedVoiceModel()).toBe('server-voice');
  });

  it('resolveUserVoiceModel falls back when settings fail', async () => {
    voiceService.cacheVoiceModel('cached-fallback');
    mockFetchAPI.mockRejectedValueOnce(new Error('offline'));
    const model = await voiceService.resolveUserVoiceModel();
    expect(model).toBe('cached-fallback');
  });

  it('resolveUserVoiceModel persists default when none saved', async () => {
    voiceService.clearCachedVoiceModel();
    mockFetchAPI.mockResolvedValueOnce({ voice_model: null });
    mockFetchAPI.mockResolvedValueOnce({ voice_model: voiceService.DEFAULT_VOICE_MODEL });
    const model = await voiceService.resolveUserVoiceModel();
    expect(model).toBe(voiceService.DEFAULT_VOICE_MODEL);
  });

  it('resolveUserVoiceModel uses default cache when persist fails', async () => {
    voiceService.clearCachedVoiceModel();
    mockFetchAPI.mockResolvedValueOnce({ voice_model: null });
    mockFetchAPI.mockRejectedValueOnce(new Error('put failed'));
    const model = await voiceService.resolveUserVoiceModel();
    expect(model).toBe(voiceService.DEFAULT_VOICE_MODEL);
    expect(voiceService.getCachedVoiceModel()).toBe(voiceService.DEFAULT_VOICE_MODEL);
  });
});
