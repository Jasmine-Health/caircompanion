import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../components/ui';
import { CircularProgressRing } from '../components/progress/CircularProgressRing';

const SCORE = 82;
const PROGRESS = SCORE / 100;

export function HealthScorePage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Health score preview (demo data)</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-bottom-nav md:pb-8">
        <h2 className="text-xl font-bold text-gray-900 md:hidden mb-6">Health Score</h2>

        <div className="flex flex-col items-center">
          <CircularProgressRing progress={PROGRESS} progressColor="#10B981" size={180} strokeWidth={16}>
            <span className="text-5xl font-bold text-emerald-500">{SCORE}</span>
          </CircularProgressRing>

          <p className="mt-3 text-sm font-medium text-emerald-600">↑ 5 pts from last week</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <MetricCard emoji="💊" value="85%" label="Med Compliance" />
          <MetricCard emoji="📱" value="78" label="Engagement" />
        </div>

        <Card className="mt-4">
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h3 className="text-lg font-bold text-gray-900">Insights</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• You&apos;re in the top 20% for compliance</li>
              <li>• Try setting consistent reminder times</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function MetricCard({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center text-center py-5">
        <div className="w-10 h-10 rounded-full bg-[#6F42C1]/10 flex items-center justify-center text-xl">
          {emoji}
        </div>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}
