import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { completeCareStep, getCareSteps, type CareStep } from '../services/healthDataService';
import { formatDate } from '../lib/utils';

const HF_SLOTS = ['Take medications', 'Daily weight', 'Symptom check-in', 'Fluid limit'];
const COPD_SLOTS = ['Maintenance inhaler', 'Oxygen saturation', 'Symptom check-in', 'Refill inhalers'];

function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function stepDue(value?: string | null): string {
  if (!value) return '';
  const date = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

function stepIsOpen(step: CareStep): boolean {
  return step.status !== 'followed_through' && step.status !== 'skipped_by_clinician';
}

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

function stepTime(value?: string | null): string {
  if (!value || !value.includes('T')) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CareStepsPage() {
  const [steps, setSteps] = useState<CareStep[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedKey = dateKey(selectedDate);
  const todayKey = dateKey(new Date());

  const load = () => {
    setIsLoading(true);
    getCareSteps()
      .then((rows) => {
        setSteps(rows);
        setError(null);
      })
      .catch(() => {
        setSteps([]);
        setError('Could not load care steps.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!snackbar) return;
    const timer = setTimeout(() => setSnackbar(null), 3000);
    return () => clearTimeout(timer);
  }, [snackbar]);

  const markDone = async (step: CareStep) => {
    const lookup = step.state_id || step.step_id;
    setBusy(lookup);
    setError(null);
    try {
      await completeCareStep(lookup);
      setSteps((prev) =>
        prev.map((item) =>
          (item.state_id || item.step_id) === lookup ? { ...item, status: 'followed_through' } : item
        )
      );
      setSnackbar('Care step marked as complete');
    } catch {
      setError('Could not mark that step done.');
      setSnackbar('Failed to complete care step');
    } finally {
      setBusy(null);
    }
  };

  const changeDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const visible = steps
    .filter((step) => {
      const due = stepDue(step.due_date);
      if (due === selectedKey) return true;
      return selectedKey === todayKey && stepIsOpen(step) && due !== '' && due <= todayKey;
    })
    .sort((a, b) => stepDue(a.due_date).localeCompare(stepDue(b.due_date)));

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Care steps</h1>
          <p className="text-sm text-gray-500 mt-1">View your care tasks and mark them done</p>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl p-3 mb-4 border border-gray-100">
          <button type="button" onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">{formatDate(selectedDate)}</span>
          <button type="button" onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error && steps.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ListChecks className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No care steps</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              No care steps for this date. Try selecting a different date.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {visible.map((step) => {
              const lookup = step.state_id || step.step_id;
              const open = stepIsOpen(step);
              const time = stepTime(step.due_date);
              const due = stepDue(step.due_date);
              return (
                <motion.div
                  key={lookup}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className={`p-4 ${open ? '' : 'opacity-60'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {busy === lookup ? (
                          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ListChecks className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-900 leading-snug">{stepTitle(step)}</p>
                          {time && (
                            <span className="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-md bg-indigo-50 text-indigo-700">
                              {time}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Care step</span>
                          {step.pathway_name && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">{step.pathway_name}</span>
                          )}
                          {due && due < todayKey && open && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700">Overdue</span>
                          )}
                          {!open && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-600">
                              <Check className="w-3 h-3" />
                              Done
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <>
                      <div className="border-t border-gray-100" />
                      <button
                        type="button"
                        disabled={busy === lookup}
                        onClick={() => markDone(step)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {busy === lookup ? 'Saving' : 'Complete'}
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-auto bg-gray-900 text-white px-4 py-3 rounded-xl text-sm z-50"
          >
            {snackbar}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
