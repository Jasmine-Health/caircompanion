import { fetchAPI, API_ENDPOINTS } from '../config/api';

export interface DailySummary {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  language: string;
  conditions: string[];
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    timing: string;
    instructions: string;
  }>;
  allergies: string[];
  recent_vitals: Record<string, {
    value: number;
    value_string: string;
    unit: string;
    effective_date: string;
    source: string;
  }>;
  alerts: {
    total_active: number;
    completed_today: number;
  };
  care_plans: Array<{
    plan_id: string;
    name: string;
    description: string | null;
    type: string;
    phase: string;
    status: string;
    plan_type: string;
  }>;
}

export interface Alert {
  id: string;
  patient_id: string;
  org_id: string;
  type: string;
  title: string;
  description: string;
  time: string[];
  frequency: string;
  days_of_week: string[];
  is_active: boolean;
  completed_dates: string[];
  snoozed_until: string | null;
  expires_at: string | null;
  source: string;
  source_ref: string;
  created_at: string;
  is_completed_today: boolean;
}

export interface AlertsResponse {
  patient_id: string;
  date: string;
  count: number;
  alerts: Alert[];
}

export interface CarePlan {
  plan_id: string;
  name: string;
  description: string | null;
  type: string;
  phase: string;
  status: string;
  plan_type: string;
}

export interface CarePlanDetail extends CarePlan {
  activities: any[];
  instructions: Array<{
    section_type: string;
    title: string;
    content: string;
  }>;
}

export interface TrackerObservation {
  id: string;
  patient_id: string;
  observation_type: string;
  code: string;
  display: string;
  value: number;
  value_string: string;
  unit: string;
  source: string;
  source_ref: string;
  confidence: number;
  effective_date: string;
  recorded_at: string;
  status: string;
}

export interface TrackersResponse {
  patient_id: string;
  type: string;
  count: number;
  observations: TrackerObservation[];
}

export interface TrackerSummaryEntry {
  display: string;
  value: number | null;
  value_string: string;
  unit: string;
  source: string;
  effective_date: string;
}

export interface TrackerSummarySection {
  count: number;
  entries: TrackerSummaryEntry[];
}

export interface TrackersSummaryResponse {
  patient_id: string;
  date: string;
  summary: {
    vital: TrackerSummarySection;
    medication_event: TrackerSummarySection;
    exercise: TrackerSummarySection;
    diet: TrackerSummarySection;
    sleep: TrackerSummarySection;
    mood: TrackerSummarySection;
  };
}

export async function getDailySummary(date: string, patientEmail?: string): Promise<DailySummary> {
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<DailySummary>(`${API_ENDPOINTS.SUMMARY}?date=${date}`, {
    headers,
  });
}

export async function getAlerts(params: { date?: string; type?: string; is_active?: boolean }, patientEmail?: string): Promise<AlertsResponse> {
  const queryParams = new URLSearchParams();
  if (params.date) queryParams.append('date', params.date);
  if (params.type) queryParams.append('type', params.type);
  if (params.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
  
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<AlertsResponse>(`${API_ENDPOINTS.ALERTS_V2}?${queryParams.toString()}`, {
    headers,
  });
}

export async function completeAlert(alertId: string, date: string): Promise<{ status: string; alert_id: string; completed_date: string }> {
  return fetchAPI<{ status: string; alert_id: string; completed_date: string }>(API_ENDPOINTS.ALERT_COMPLETE(alertId), {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
}

export async function snoozeAlert(alertId: string, minutes: number): Promise<{ status: string; alert_id: string; snoozed_minutes: number; snoozed_until: string }> {
  return fetchAPI<{ status: string; alert_id: string; snoozed_minutes: number; snoozed_until: string }>(API_ENDPOINTS.ALERT_SNOOZE(alertId), {
    method: 'POST',
    body: JSON.stringify({ minutes }),
  });
}

export async function getCarePlans(patientEmail?: string): Promise<{ patient_id: string; count: number; care_plans: CarePlan[] }> {
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<{ patient_id: string; count: number; care_plans: CarePlan[] }>(API_ENDPOINTS.CAREPLAN_V2, {
    headers,
  });
}

export async function getCarePlanDetail(planId: string, patientEmail?: string): Promise<CarePlanDetail> {
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<CarePlanDetail>(API_ENDPOINTS.CAREPLAN_DETAIL(planId), {
    headers,
  });
}

export async function getVitals(params: { start_date?: string; end_date?: string; source?: string }, patientEmail?: string): Promise<TrackersResponse> {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.source) queryParams.append('source', params.source);
  
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<TrackersResponse>(`${API_ENDPOINTS.TRACKERS_V2_VITALS}?${queryParams.toString()}`, {
    headers,
  });
}

export async function getMedications(params: { start_date?: string; end_date?: string }, patientEmail?: string): Promise<TrackersResponse> {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<TrackersResponse>(`${API_ENDPOINTS.TRACKERS_V2_MEDICATIONS}?${queryParams.toString()}`, {
    headers,
  });
}

export async function getExercise(params: { start_date?: string; end_date?: string }, patientEmail?: string): Promise<TrackersResponse> {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<TrackersResponse>(`${API_ENDPOINTS.TRACKERS_V2_EXERCISE}?${queryParams.toString()}`, {
    headers,
  });
}

export async function getDiet(params: { start_date?: string; end_date?: string }, patientEmail?: string): Promise<TrackersResponse> {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<TrackersResponse>(`${API_ENDPOINTS.TRACKERS_V2_DIET}?${queryParams.toString()}`, {
    headers,
  });
}

export async function getSleep(params: { start_date?: string; end_date?: string }, patientEmail?: string): Promise<TrackersResponse> {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<TrackersResponse>(`${API_ENDPOINTS.TRACKERS_V2_SLEEP}?${queryParams.toString()}`, {
    headers,
  });
}

export async function getMood(params: { start_date?: string; end_date?: string }, patientEmail?: string): Promise<TrackersResponse> {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<TrackersResponse>(`${API_ENDPOINTS.TRACKERS_V2_MOOD}?${queryParams.toString()}`, {
    headers,
  });
}

export async function getTrackersSummary(date?: string, patientEmail?: string): Promise<TrackersSummaryResponse> {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append('date', date);
  
  const headers: Record<string, string> = {};
  if (patientEmail) {
    headers['X-Patient-Email'] = patientEmail;
  }
  
  return fetchAPI<TrackersSummaryResponse>(`${API_ENDPOINTS.TRACKERS_V2_SUMMARY}?${queryParams.toString()}`, {
    headers,
  });
}
