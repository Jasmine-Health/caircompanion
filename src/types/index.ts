export interface User {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  database_name: string;
  is_active: boolean;
  agreed_to_sms: boolean;
  role: 'patient' | 'cairgiver';
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface PatientSummary {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  language: string;
  conditions: string[];
  medications: Medication[];
  allergies: string[];
  recent_vitals: Record<string, VitalReading>;
  alerts: {
    total_active: number;
    completed_today: number;
  };
  care_plans: CarePlan[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  instructions: string;
}

export interface VitalReading {
  value: number;
  value_string: string;
  unit: string;
  effective_date: string;
  source: string;
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

export interface Alert {
  id: string;
  patient_id: string;
  org_id: string;
  type: 'medication' | 'exercise' | 'diet' | 'appointment' | 'monitoring';
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

export interface Observation {
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

export interface Caregiver {
  relationship_id: string;
  cairgiver_email: string;
  cairgiver_name: string;
  status: 'approved' | 'pending' | 'rejected';
  initiator: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverRequest {
  relationship_id: string;
  email: string;
  name: string;
  role: string;
  initiator: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceModel {
  name: string;
  model: string;
  gender: string;
  age: string;
  language: string;
  accent: string;
  characteristics: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
