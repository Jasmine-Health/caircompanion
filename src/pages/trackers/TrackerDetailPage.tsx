import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Pill, 
  Dumbbell, 
  Apple, 
  Moon, 
  Smile,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Card, CardContent, Badge } from '../../components/ui';
import { 
  mockVitalsHistory, 
  mockMedicationHistory, 
  mockExerciseHistory, 
  mockSleepHistory, 
  mockMoodHistory, 
  mockDietHistory 
} from '../../data/mockData';
import { formatDate, formatTime } from '../../lib/utils';
import type { Observation } from '../../types';

const trackerConfig: Record<string, {
  name: string;
  icon: React.ElementType;
  color: string;
  iconColor: string;
  bgColor: string;
}> = {
  vitals: {
    name: 'Vitals',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-100',
  },
  medication: {
    name: 'Medication',
    icon: Pill,
    color: 'from-purple-500 to-indigo-500',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-100',
  },
  exercise: {
    name: 'Exercise',
    icon: Dumbbell,
    color: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  diet: {
    name: 'Diet',
    icon: Apple,
    color: 'from-orange-500 to-amber-500',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-100',
  },
  sleep: {
    name: 'Sleep',
    icon: Moon,
    color: 'from-blue-500 to-cyan-500',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-100',
  },
  mood: {
    name: 'Mood',
    icon: Smile,
    color: 'from-yellow-500 to-orange-500',
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
  },
};

const trackerData: Record<string, Observation[]> = {
  vitals: mockVitalsHistory,
  medication: mockMedicationHistory,
  exercise: mockExerciseHistory,
  diet: mockDietHistory,
  sleep: mockSleepHistory,
  mood: mockMoodHistory,
};

function getTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export function TrackerDetailPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const config = trackerConfig[trackerId || 'vitals'];
  const data = trackerData[trackerId || 'vitals'] || [];
  const Icon = config?.icon || Heart;

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Tracker not found</h1>
          <Link to="/trackers" className="text-[#6F42C1] mt-2 inline-block">
            Go back to trackers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - hidden on mobile, shown on desktop */}
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/trackers" 
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Trackers
          </Link>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
              <p className="text-gray-500 mt-1">Track your {config.name.toLowerCase()} data</p>
            </div>
          </div>
        </div>
      </header>

      {/* Date Filter */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button className="px-4 py-2 rounded-full bg-[#6F42C1] text-white text-sm font-medium whitespace-nowrap">
            Today
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
            This Week
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
            This Month
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Custom
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent>
                <p className="text-sm text-gray-500">Latest Reading</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data[0].value_string}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(data[0].effective_date)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  This period
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data List */}
        <h2 className="font-semibold text-gray-900 mb-3">History</h2>
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-8 h-8 ${config.iconColor}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No data yet</h3>
              <p className="text-sm text-gray-500">
                Start tracking your {config.name.toLowerCase()} to see data here
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {data.map((observation, index) => {
              const trend = index < data.length - 1 
                ? getTrend(observation.value, data[index + 1].value)
                : 'stable';

              return (
                <motion.div key={observation.id} variants={item}>
                  <Card>
                    <CardContent className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{observation.display}</p>
                          {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(observation.effective_date)} at {formatTime(observation.effective_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {observation.value_string}
                        </p>
                        {observation.unit && (
                          <p className="text-xs text-gray-500">{observation.unit}</p>
                        )}
                      </div>
                      <Badge variant={observation.source === 'device' ? 'info' : 'default'}>
                        {observation.source}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
