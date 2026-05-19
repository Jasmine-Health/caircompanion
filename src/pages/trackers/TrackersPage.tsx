import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { 
  Heart, 
  Pill, 
  Dumbbell, 
  Apple, 
  Moon, 
  Smile,
  ChevronRight,
  Activity
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

const trackers = [
  {
    id: 'vitals',
    name: 'Vitals',
    description: 'Blood pressure, heart rate, glucose',
    icon: Heart,
    color: 'bg-red-100',
    iconColor: 'text-red-500',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    id: 'medication',
    name: 'Medication',
    description: 'Track medication adherence',
    icon: Pill,
    color: 'bg-purple-100',
    iconColor: 'text-purple-500',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'exercise',
    name: 'Exercise',
    description: 'Activity and workout logs',
    icon: Dumbbell,
    color: 'bg-green-100',
    iconColor: 'text-green-500',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'diet',
    name: 'Diet',
    description: 'Meals and nutrition tracking',
    icon: Apple,
    color: 'bg-orange-100',
    iconColor: 'text-orange-500',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Sleep duration and quality',
    icon: Moon,
    color: 'bg-blue-100',
    iconColor: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'mood',
    name: 'Mood',
    description: 'Emotional wellbeing tracking',
    icon: Smile,
    color: 'bg-yellow-100',
    iconColor: 'text-yellow-500',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function TrackersPage() {
  const [trackerData, setTrackerData] = useState<Record<string, TrackerObservation[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllTrackers = async () => {
      try {
        const [vitals, medications, exercise, diet, sleep, mood] = await Promise.all([
          getVitals({}, undefined).then(r => r.observations),
          getMedications({}, undefined).then(r => r.observations),
          getExercise({}, undefined).then(r => r.observations),
          getDiet({}, undefined).then(r => r.observations),
          getSleep({}, undefined).then(r => r.observations),
          getMood({}, undefined).then(r => r.observations),
        ]);
        setTrackerData({
          vitals,
          medication: medications,
          exercise,
          diet,
          sleep,
          mood,
        });
      } catch (error) {
        console.error('Failed to load tracker data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllTrackers();
  }, []);

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
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Trackers</h1>
            <p className="text-gray-500 mt-1">Monitor your health data</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4"
        >
          {trackers.map((tracker) => {
            const Icon = tracker.icon;
            const data = trackerData[tracker.id] || [];
            return (
              <motion.div key={tracker.id} variants={item}>
                <Link to={`/trackers/${tracker.id}`}>
                  <Card className="hover:shadow-md transition-all duration-200 overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 p-4">
                        <div className={`w-14 h-14 rounded-xl ${tracker.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className={`w-7 h-7 ${tracker.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#6F42C1] transition-colors">
                            {tracker.name}
                          </h3>
                          <p className="text-sm text-gray-500">{tracker.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{data.length}</p>
                          <p className="text-xs text-gray-500">records</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#6F42C1] group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className={`h-1 bg-gradient-to-r ${tracker.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
