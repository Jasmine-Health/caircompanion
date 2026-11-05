import type { ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';
import { CircularProgressRing } from '../components/progress/CircularProgressRing';

export function ProgressPage() {
  const today = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Progress</h1>
            <p className="text-gray-500 mt-1">{today} · demo data</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-bottom-nav md:pb-8 space-y-4">
        <div className="md:hidden flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Today&apos;s Progress</h2>
            <p className="text-sm text-gray-500">{today}</p>
          </div>
          <BarChart3 className="w-7 h-7 text-[#6F42C1]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ProgressMetricCard
            emoji="💧"
            iconBg="bg-blue-50"
            value="1.5L"
            goal="of 2L goal"
            progress={0.75}
            color="#3B82F6"
            footnote={
              <Button
                type="button"
                className="rounded-full text-xs py-1.5 px-3 h-auto"
                onClick={() => {}}
              >
                + Add 250ml
              </Button>
            }
          />
          <ProgressMetricCard
            emoji="🚶"
            iconBg="bg-emerald-50"
            value="3.2K"
            goal="of 5K goal"
            progress={0.64}
            color="#10B981"
            footnote={
              <p className="text-xs font-medium text-emerald-600">↑ 12% vs yesterday</p>
            }
          />
        </div>

        <MedicationAdherenceCard adherence={0.85} />
      </main>
    </div>
  );
}

function ProgressMetricCard({
  emoji,
  iconBg,
  value,
  goal,
  progress,
  color,
  footnote,
}: {
  emoji: string;
  iconBg: string;
  value: string;
  goal: string;
  progress: number;
  color: string;
  footnote: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-4">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center text-xl`}>
          {emoji}
        </div>
        <CircularProgressRing
          className="mt-3"
          size={100}
          strokeWidth={10}
          trackColor={`${color}22`}
          progress={progress}
          progressColor={color}
        >
          <span className="text-lg font-bold text-gray-900">{value}</span>
        </CircularProgressRing>
        <p className="mt-2 text-xs text-gray-500">{goal}</p>
        <div className="mt-2 min-h-[32px] flex items-center">{footnote}</div>
      </CardContent>
    </Card>
  );
}

function MedicationAdherenceCard({ adherence }: { adherence: number }) {
  const pct = Math.round(adherence * 100);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-xl">
            💊
          </div>
          <p className="flex-1 font-semibold text-gray-900">Medication Adherence</p>
          <p className="font-bold text-emerald-600">{pct}%</p>
        </div>
        <div className="mt-3 h-3 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
