import { describe, expect, it } from 'vitest';
import { stepTitle } from './CareStepsPage';
import type { CareStep } from '../services/healthDataService';

describe('CareStepsPage helpers', () => {
  it('uses label when it is meaningful', () => {
    const step: CareStep = { step_id: 'x', label: 'Daily weight', status: 'pending' };
    expect(stepTitle(step)).toBe('Daily weight');
  });

  it('maps HF seed slot ids to catalog titles', () => {
    const step: CareStep = {
      step_id: 'seed_daily_plan_w1_s2',
      label: 'Step',
      status: 'pending',
      pathway_name: 'Heart failure',
    };
    expect(stepTitle(step)).toBe('Daily weight');
  });

  it('maps COPD seed slot ids to catalog titles', () => {
    const step: CareStep = {
      step_id: 'seed_daily_plan_w1_s3',
      label: 'Step',
      status: 'pending',
      pathway_name: 'COPD management',
    };
    expect(stepTitle(step)).toBe('Symptom check-in');
  });

  it('humanizes raw step ids', () => {
    const step: CareStep = { step_id: 'hf_morning_checkin', label: '', status: 'pending' };
    expect(stepTitle(step)).toBe('Morning check-in');
  });
});
