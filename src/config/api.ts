const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  TOKEN: '/auth/token',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot_password',
  RESET_PASSWORD: '/auth/reset_password',
  VERIFY_RESET_TOKEN: '/auth/verify_password_reset_token',
  CHANGE_PASSWORD: '/auth/change_password',
  
  // Social Auth
  GOOGLE_LOGIN: '/google_auth/login',
  APPLE_CALLBACK: '/apple_auth/callback',
  ENTRA_LOGIN: '/entra_auth/login',
  
  // Organizations
  ORGANIZATIONS: '/organizations',
  ENROLL: '/organizations/enroll',
  MY_ENROLLMENTS: '/organizations/my-enrollments',
  SWITCH: '/organizations/switch',
  CURRENT: '/organizations/current',
  UNENROLL: (orgId: string) => `/organizations/unenroll/${orgId}`,
  
  // Health Data
  SUMMARY: '/summary',
  ALERTS_V2: '/alerts_v2',
  ALERT_COMPLETE: (alertId: string) => `/alerts_v2/${alertId}/complete`,
  ALERT_SNOOZE: (alertId: string) => `/alerts_v2/${alertId}/snooze`,
  CAREPLAN_V2: '/careplan_v2',
  CAREPLAN_DETAIL: (planId: string) => `/careplan_v2/${planId}`,
  TRACKERS_V2_VITALS: '/trackers_v2/vitals',
  TRACKERS_V2_MEDICATIONS: '/trackers_v2/medications',
  TRACKERS_V2_EXERCISE: '/trackers_v2/exercise',
  TRACKERS_V2_DIET: '/trackers_v2/diet',
  TRACKERS_V2_SLEEP: '/trackers_v2/sleep',
  TRACKERS_V2_MOOD: '/trackers_v2/mood',
  TRACKERS_V2_SUMMARY: '/trackers_v2/summary',
  
  // Cairgiver
  CAIRGIVER_REQUEST: '/cairgiver/request',
  CAIRGIVER_PATIENTS: '/cairgiver/patients',
  CAIRGIVER_PATIENT_DETAIL: (patientEmail: string) => `/cairgiver/patients/${patientEmail}`,
  CAIRGIVER_REQUESTS_PENDING: '/cairgiver/requests/pending',
  CAIRGIVER_REQUEST_APPROVE: '/cairgiver/request/approve',
  CAIRGIVER_REQUEST_CANCEL: '/cairgiver/request/cancel',
  CAIRGIVER_CAIRGIVERS: '/cairgiver/cairgivers',
  CAIRGIVER_CAIRGIVER_DETAIL: (cairgiverEmail: string) => `/cairgiver/cairgivers/${cairgiverEmail}`,
  CAIRGIVER_PATIENT_LIST: '/cairgiver/patient-list',
  CAIRGIVER_PATIENT_REQUEST: '/cairgiver/patient/request',
  CAIRGIVER_PATIENT_REMOVE: '/cairgiver/patient/remove',
  CAIRGIVER_CAIRGIVER_REMOVE: '/cairgiver/cairgiver/remove',
  
  // Voice
  VOICE_SAMPLE: '/voice/sample',
  VOICE_MODELS: '/voice/models',
  VOICE_SETTINGS: '/voice/settings',

  // Account
  TIMEZONE: '/auth/timezone',
  DELETE_ACCOUNT: '/auth/account',
  SET_PUSH_TOKEN: '/auth/set_push_token',

  // Connectors
  CONNECTORS: '/connectors/',
  CONNECTOR: (ehrSystem: string) => `/connectors/${ehrSystem}`,
  CONNECTOR_AUTHORIZE: (ehrSystem: string) => `/connectors/${ehrSystem}/authorize`,

  // Collections
  COLLECTION_PATIENT: '/collections/Patient',
  COLLECTION_ENCOUNTER: '/collections/Encounter',
  COLLECTION_DIAGNOSTIC_REPORT: '/collections/DiagnosticReport',
};

export class APIError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add Authorization header if token exists
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'API request failed',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error or server unavailable');
  }
}

// Helper for form data (login, password reset)
export async function fetchAPIWithFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method: 'POST',
    body: formData,
    headers: {},
  };

  // Add Authorization header if token exists
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'API request failed',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error or server unavailable');
  }
}
