import type { Alert, CarePlan, CarePlanDetail, CarePlanStep } from '../services/healthDataService';
import type { Connector } from '../services/connectorService';

export const mockCarePlanStep: CarePlanStep = {
  step_id: 'st-1',
  label: 'Morning walk',
  type: 'exercise',
  priority: 'medium',
  description: 'Easy pace',
  due_rule: null,
  order_index: 1,
  status: 'pending',
  due_date: '2026-01-01',
  followed_through_at: null,
};

export const mockCarePlanSummary: CarePlan = {
  plan_id: 'plan-1',
  name: 'Recovery Plan',
  description: 'Follow daily steps',
  type: 'general',
  phase: '1',
  status: 'active',
  plan_type: 'care',
};

export const mockCarePlanDetail: CarePlanDetail = {
  ...mockCarePlanSummary,
  activities: ['Walk 10 minutes'],
  instructions: [{ section_type: 'note', title: 'Note', content: 'Hydrate well' }],
  steps: [
    {
      ...mockCarePlanStep,
      label: 'Walk',
      status: 'followed_through',
      followed_through_at: '2026-01-02',
    },
  ],
  patient_context: {
    medications: [{ name: 'Med A', dosage: '5mg', frequency: 'Daily', timing: 'AM', instructions: '' }],
    monitoring: [{ name: 'Weight', value_string: '180 lbs', unit: 'lbs', effective_date: '2026-01-01' }],
    conditions: [{ title: 'HF', code: 'I50' }],
    allergies: ['Sulfa'],
  },
};

export const mockAlert: Alert = {
  id: 'alert-1',
  patient_id: 'p1',
  org_id: 'org-1',
  type: 'medication',
  title: 'Morning medication',
  description: 'Take with food',
  time: ['08:00'],
  frequency: 'daily',
  days_of_week: ['monday'],
  is_active: true,
  completed_dates: [],
  snoozed_until: null,
  expires_at: null,
  source: 'manual',
  source_ref: 'ref-1',
  created_at: '2026-01-01T08:00:00Z',
  is_completed_today: false,
};

export const mockConnector: Connector = {
  ehr_system: 'epic',
  is_active: true,
  is_authorized: false,
  status: 'connected',
};

export const mockSnoozeResult = {
  status: 'ok',
  alert_id: 'alert-1',
  snoozed_minutes: 15,
  snoozed_until: '2026-01-01T09:15:00Z',
};
