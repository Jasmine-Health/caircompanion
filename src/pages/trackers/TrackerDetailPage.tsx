import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  BarChart3,
  Clock3,
  Heart, 
  Pill, 
  Dumbbell, 
  Apple, 
  Moon, 
  Smile,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui';
import { 
  getVitals,
  getMedications,
  getExercise,
  getDiet,
  getSleep,
  getMood,
  type TrackerObservation
} from '../../services/healthDataService';
import { formatDate, formatTime } from '../../lib/utils';

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

type TrackerParams = {
  start_date?: string;
  end_date?: string;
  source?: string;
};

const trackerAPIs: Record<string, (params: TrackerParams, patientEmail?: string) => Promise<{ observations: TrackerObservation[] }>> = {
  vitals: getVitals,
  medication: getMedications,
  exercise: getExercise,
  diet: getDiet,
  sleep: getSleep,
  mood: getMood,
};

function getTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

function getObservationValue(observation?: TrackerObservation) {
  return observation?.value_string || observation?.display || '-';
}

function SummaryTile({
  icon: TileIcon,
  label,
  value,
  detail,
  valueClass = 'text-gray-900',
  iconClass = 'text-gray-500',
  bgClass = 'bg-gray-100',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  detail: string;
  valueClass?: string;
  iconClass?: string;
  bgClass?: string;
}) {
  return (
    <div className="min-h-[132px] rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgClass}`}>
            <TileIcon className={`h-4 w-4 ${iconClass}`} />
          </div>
        </div>
        <div className="min-w-0">
          <p className={`break-words text-xl font-bold leading-tight ${valueClass}`}>
            {value}
          </p>
          <p className="mt-1 truncate text-sm text-gray-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export function TrackerDetailPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const config = trackerConfig[trackerId || 'vitals'];
  const [observations, setObservations] = useState<TrackerObservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'today' | 'week' | 'month' | 'custom' | 'all'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const Icon = config?.icon || Heart;
  const latestValue = getObservationValue(observations[0]);
  const previousValue = getObservationValue(observations[1]);
  const hasPreviousValue = previousValue !== '-';

  const trendSummary = (() => {
    if (observations.length < 2) {
      return {
        value: 'Not enough data',
        detail: 'Add another entry',
        icon: BarChart3,
        valueClass: 'text-gray-700',
        iconClass: config?.iconColor || 'text-gray-500',
        bgClass: config?.bgColor || 'bg-gray-100',
      };
    }

    const current = parseFloat(latestValue) || 0;
    const previous = parseFloat(previousValue) || 0;
    const trend = getTrend(current, previous);

    if (trend === 'up') {
      return {
        value: 'Trending up',
        detail: 'Compared with previous',
        icon: TrendingUp,
        valueClass: 'text-green-700',
        iconClass: 'text-green-600',
        bgClass: 'bg-green-100',
      };
    }

    if (trend === 'down') {
      return {
        value: 'Trending down',
        detail: 'Compared with previous',
        icon: TrendingDown,
        valueClass: 'text-red-700',
        iconClass: 'text-red-600',
        bgClass: 'bg-red-100',
      };
    }

    return {
      value: 'Stable',
      detail: 'Compared with previous',
      icon: BarChart3,
      valueClass: 'text-gray-800',
      iconClass: 'text-gray-600',
      bgClass: 'bg-gray-100',
    };
  })();

  useEffect(() => {
    const loadData = async () => {
      if (!trackerId) return;
      
      try {
        const apiFunction = trackerAPIs[trackerId];
        if (!apiFunction) return;
        
        const params: TrackerParams = {};
        const now = new Date();

        switch (selectedFilter) {
          case 'today':
            params.start_date = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
            break;
          case 'week': {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            params.start_date = weekAgo.toISOString().split('T')[0];
            break;
          }
          case 'month': {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            params.start_date = monthAgo.toISOString().split('T')[0];
            break;
          }
          case 'custom':
            if (customStartDate) {
              params.start_date = customStartDate;
            }
            break;
          default:
            break;
        }

        if (selectedFilter === 'custom' && customEndDate) {
          params.end_date = customEndDate;
        }
        
        const response = await apiFunction(params);
        setObservations(response.observations);
      } catch (error) {
        console.error(`Failed to load ${trackerId} data:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [trackerId, selectedFilter, customStartDate, customEndDate]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
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
          <button 
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'all' 
                ? 'bg-[#6F42C1] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setSelectedFilter('today')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'today' 
                ? 'bg-[#6F42C1] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setSelectedFilter('week')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'week' 
                ? 'bg-[#6F42C1] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button 
            onClick={() => setSelectedFilter('month')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'month' 
                ? 'bg-[#6F42C1] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button 
            onClick={() => setSelectedFilter('custom')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'custom' 
                ? 'bg-[#6F42C1] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        </div>
        {selectedFilter === 'custom' && (
          <div className="max-w-2xl mx-auto mt-3 flex items-center gap-3">
            <div className="flex-1">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <span className="text-gray-400">to</span>
            <div className="flex-1">
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        {observations.length > 0 && (
          <motion.div variants={item} className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <SummaryTile
              icon={BarChart3}
              label="Total Records"
              value={observations.length}
              detail="Logged entries"
              iconClass={config.iconColor}
              bgClass={config.bgColor}
            />
            <SummaryTile
              icon={Clock3}
              label="Latest"
              value={latestValue}
              detail="Most recent entry"
              iconClass={config.iconColor}
              bgClass={config.bgColor}
            />
            <SummaryTile
              icon={Clock3}
              label="Previous"
              value={hasPreviousValue ? previousValue : 'No previous entry'}
              detail={hasPreviousValue ? 'Before latest' : 'Needs another record'}
              valueClass={hasPreviousValue ? 'text-gray-900' : 'text-gray-500'}
              iconClass={config.iconColor}
              bgClass={config.bgColor}
            />
            <SummaryTile
              icon={trendSummary.icon}
              label="Trend"
              value={trendSummary.value}
              detail={trendSummary.detail}
              valueClass={trendSummary.valueClass}
              iconClass={trendSummary.iconClass}
              bgClass={trendSummary.bgClass}
            />
          </motion.div>
        )}

        {/* History */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">History</h2>
          </div>
          <Card>
            <CardContent className="divide-y divide-gray-100">
              {observations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No data available</p>
                </div>
              ) : (
                observations.map((obs, index) => (
                  <div
                    key={obs.id}
                    className={`flex items-center justify-between ${index > 0 ? 'pt-4' : ''} ${index < observations.length - 1 ? 'pb-4' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{obs.display}</p>
                        <p className="text-sm text-gray-500">{formatDate(new Date(obs.effective_date))} at {formatTime(new Date(obs.effective_date))}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{obs.value_string}</p>
                      <p className="text-sm text-gray-500">{obs.unit}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
