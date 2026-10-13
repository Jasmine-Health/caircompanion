import { useEffect, useState } from 'react';
import { Check, CheckCircle2, ListChecks } from 'lucide-react';
import { completeCareStep, getCareSteps, type CareStep } from '../services/healthDataService';

function stepStatusLabel(status: string): string {
  if (status === 'followed_through') return 'Done';
  if (status === 'skipped_by_clinician') return 'Skipped by clinician';
  if (status === 'in_progress') return 'In progress';
  if (status === 'overdue') return 'Overdue';
  if (status === 'escalated') return 'Escalated';
  return 'Pending';
}

function stepDue(value?: string | null): string {
  if (!value) return '';
  const date = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

function stepIsOpen(step: CareStep): boolean {
  return step.status !== 'followed_through' && step.status !== 'skipped_by_clinician';
}

export function CareStepsPage() {
  const [steps, setSteps] = useState<CareStep[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const openSteps = steps.filter(stepIsOpen);
  const closedSteps = steps.filter((step) => !stepIsOpen(step));

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Care steps</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tasks your care team tracks. Marking one done updates that record.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error && steps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : steps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListChecks className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No care steps</h3>
            <p className="text-gray-500 text-sm">No care steps are assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <StepGroup title="Open" steps={openSteps} busy={busy} onDone={markDone} />
            <StepGroup title="Completed" steps={closedSteps} busy={busy} onDone={markDone} />
          </div>
        )}
      </div>
    </div>
  );
}

function StepGroup({
  title,
  steps,
  busy,
  onDone,
}: {
  title: string;
  steps: CareStep[];
  busy: string | null;
  onDone: (step: CareStep) => void;
}) {
  if (steps.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-700 mb-2">{title}</h2>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {steps.map((step) => {
          const lookup = step.state_id || step.step_id;
          const open = stepIsOpen(step);
          const due = stepDue(step.due_date);
          return (
            <div key={lookup} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${open ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label || step.step_id}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {stepStatusLabel(step.status)}
                  {due ? ` · due ${due}` : ''}
                  {step.pathway_name ? ` · ${step.pathway_name}` : ''}
                </p>
              </div>
              {open ? (
                <button
                  type="button"
                  disabled={busy === lookup}
                  onClick={() => onDone(step)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6F42C1] text-white disabled:opacity-50"
                >
                  {busy === lookup ? 'Saving' : 'Done'}
                </button>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  {step.status === 'followed_through' ? <Check className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {stepStatusLabel(step.status)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
