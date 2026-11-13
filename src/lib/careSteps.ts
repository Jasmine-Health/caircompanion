import type { CareStep } from '../services/healthDataService';

const HF_SLOTS = ['Take medications', 'Daily weight', 'Symptom check-in', 'Fluid limit'];
const COPD_SLOTS = ['Maintenance inhaler', 'Oxygen saturation', 'Symptom check-in', 'Refill inhalers'];

function humanizeStepId(stepId: string): string {
  let raw = stepId.trim();
  const lower = raw.toLowerCase();
  for (const prefix of ['hf_', 'copd_']) {
    if (lower.startsWith(prefix)) {
      raw = raw.slice(prefix.length);
      break;
    }
  }
  const words = raw.replace(/[-_]+/g, ' ').split(/\s+/).filter(Boolean).map((word) => word.toLowerCase());
  if (words.length === 0) return 'Care step';
  const titled = words[0].charAt(0).toUpperCase() + words[0].slice(1) + (words.length > 1 ? ` ${words.slice(1).join(' ')}` : '');
  return titled.replace('checkin', 'check-in');
}

export function stepTitle(step: CareStep): string {
  const label = (step.label || '').trim();
  const generic = !label || label.toLowerCase() === 'step' || label.toLowerCase() === 'care step' || /^seed_/i.test(label);
  if (!generic && label !== step.step_id) return label;

  const slot = /^seed_daily_plan_w\d+_s(\d+)$/i.exec(step.step_id || '');
  if (slot) {
    const index = Number(slot[1]);
    const catalog = (step.pathway_name || '').toLowerCase().includes('copd') ? COPD_SLOTS : HF_SLOTS;
    if (index >= 1 && index <= catalog.length) return catalog[index - 1];
  }
  if (step.step_id && !/^seed_/i.test(step.step_id)) return humanizeStepId(step.step_id);
  return 'Care step';
}
