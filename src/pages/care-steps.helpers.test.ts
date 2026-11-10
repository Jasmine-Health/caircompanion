import { describe, expect, it } from 'vitest';
import { groupStepsByDate, sectionDateLabel, stepTitle } from './CareStepsPage';
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

describe('groupStepsByDate', () => {
  it('groups steps by due date and sorts newest dates first', () => {
    const steps: CareStep[] = [
      { step_id: 'a', label: 'A', status: 'pending', due_date: '2026-02-01' },
      { step_id: 'b', label: 'B', status: 'followed_through', due_date: '2026-02-02' },
      { step_id: 'c', label: 'C', status: 'pending', due_date: '2026-02-01' },
    ];
    const groups = groupStepsByDate(steps);
    expect(groups.map((g) => g.dateKey)).toEqual(['2026-02-02', '2026-02-01']);
    expect(groups[1].steps.map((s) => s.step_id)).toEqual(['a', 'c']);
  });

  it('labels today in section headers', () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const key = `${today.getFullYear()}-${month}-${day}`;
    expect(sectionDateLabel(key, key)).toBe('Today');
  });
});
