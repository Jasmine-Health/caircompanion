import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Droplets, 
  Scale, 
  Pill, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Badge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { mockPatientSummary, mockAlerts } from '../data/mockData';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

const vitalIcons: Record<string, React.ReactNode> = {
  'Blood Pressure': <Heart className="w-5 h-5 text-red-500" />,
  'Heart Rate': <Activity className="w-5 h-5 text-pink-500" />,
  'Blood Glucose': <Droplets className="w-5 h-5 text-blue-500" />,
  'Weight': <Scale className="w-5 h-5 text-green-500" />,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function DashboardPage() {
  useAuth();
  const summary = mockPatientSummary;
  const alerts = mockAlerts;
  const pendingAlerts = alerts.filter(a => !a.is_completed_today);
  const completedAlerts = alerts.filter(a => a.is_completed_today);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6F42C1] to-[#8b5cf6] text-white px-4 py-8 md:px-6 md:py-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/80 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {summary.first_name} {summary.last_name}
            </h1>
            <p className="text-white/70 text-sm mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(new Date())}
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Quick Stats */}
          <motion.div variants={item} className="grid grid-cols-2 gap-4 -mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingAlerts.length}</p>
                  <p className="text-sm text-gray-500">Pending Tasks</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedAlerts.length}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Medical Conditions */}
          <motion.div variants={item}>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4 text-lg">Medical Conditions</h2>
              <div className="flex flex-wrap gap-2">
                {summary.conditions.map((condition, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Vitals */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-lg">Recent Vitals</h2>
              <Link to="/trackers/vitals" className="text-sm text-[#6F42C1] font-medium flex items-center hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summary.recent_vitals).map(([name, vital]) => (
                <div key={name} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                    {vitalIcons[name] || <Activity className="w-5 h-5 text-gray-500" />}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{name}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {vital.value_string}
                    <span className="text-sm font-normal text-gray-400 ml-1">{vital.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Medications */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-lg">Medications</h2>
              <Link to="/trackers/medication" className="text-sm text-[#6F42C1] font-medium flex items-center hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {summary.medications.map((med, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-4 p-4 ${index < summary.medications.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6F42C1]/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-5 h-5 text-[#6F42C1]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-500">{med.dosage} • {med.frequency}</p>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{med.timing}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Care Plans */}
          <motion.div variants={item}>
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Active Care Plans</h2>
            {summary.care_plans.map((plan) => (
              <div 
                key={plan.plan_id} 
                className="bg-gradient-to-r from-[#6F42C1]/5 to-[#8b5cf6]/5 rounded-2xl p-5 border border-[#6F42C1]/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.type}</p>
                  </div>
                  <Badge variant="success">{plan.status}</Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-[#6F42C1]/10">
                  <p className="text-sm text-[#6F42C1] font-medium">
                    Current Phase: {plan.phase}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Today's Tasks */}
          <motion.div variants={item} className="pb-8">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Today's Tasks</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {alerts.slice(0, 5).map((alert, index) => (
                <div 
                  key={alert.id} 
                  className={`flex items-center gap-4 p-4 ${index < 4 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    alert.is_completed_today ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {alert.is_completed_today ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${alert.is_completed_today ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-500">{alert.time.join(', ')}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    alert.type === 'medication' 
                      ? 'bg-blue-50 text-blue-700' 
                      : alert.type === 'exercise' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {alert.type}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
