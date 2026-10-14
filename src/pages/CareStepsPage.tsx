import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { completeCareStep, getCareSteps, type CareStep } from '../services/healthDataService';
import { formatDate } from '../lib/utils';

function dateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function dayBefore(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
}

function stepDue(value?: string | null): string {
  if (!value) return '';
  const date = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

function stepIsOpen(step: CareStep): boolean {
  return step.status !== 'followed_through' && step.status !== 'skipped_by_clinician';
}

function stepTitle(step: CareStep): string {
  const label = (step.label || '').trim();
  if (!label || /^seed_/i.test(label) || label === step.step_id) return 'Care step';
  return label;
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
    } catch {
      setError('Could not mark that step done.');
    } finally {
      setBusy(null);
    }
  };

  const changeDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const visible = steps.filter((step) => {
    const due = stepDue(step.due_date);
    if (due === selectedKey) return true;
    return selectedKey === todayKey && stepIsOpen(step) && due === dayBefore(selectedKey);
  });

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Care steps</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tasks your care team tracks. Marking one done updates that record.
          </p>
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
            <p className="text-sm text-gray-500 max-w-xs mx-auto">No care steps for this date.</p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {visible.map((step) => {
              const lookup = step.state_id || step.step_id;
              const open = stepIsOpen(step);
              const time = stepTime(step.due_date);
              return (
                <div key={lookup} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`p-4 ${open ? '' : 'opacity-60'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <ListChecks className="w-5 h-5 text-indigo-600" />
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
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-[#6F42C1] hover:bg-gray-50 disabled:opacity-50"
                      >
                        {busy === lookup ? 'Saving' : 'Done'}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
