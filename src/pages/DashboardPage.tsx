import { motion } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Heart, 
  Activity, 
  Droplets, 
  Scale, 
  Pill, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Clock,
  Check,
  MoreVertical
} from 'lucide-react';
import { Badge } from '../components/ui';
import { CarePlanDetailModal } from '../components/CarePlanDetailModal';
import { getDailySummary, getAlerts, completeAlert, snoozeAlert, type DailySummary, type Alert } from '../services/healthDataService';
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
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string | undefined>(undefined);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [processingAlertId, setProcessingAlertId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuId(null);
      }
    };

    if (actionMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuId]);

  const handleCarePlanClick = useCallback((planId: string, planName: string) => {
    setSelectedPlanId(planId);
    setSelectedPlanName(planName);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPlanId(null);
    setSelectedPlanName(undefined);
  }, []);

  const handleCompleteAlert = useCallback(async (alertId: string) => {
    setProcessingAlertId(alertId);
    setActionMenuId(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      await completeAlert(alertId, today);
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_completed_today: true, completed_dates: [...a.completed_dates, today] } : a
      ));
    } catch (error) {
      console.error('Failed to complete alert:', error);
    } finally {
      setProcessingAlertId(null);
    }
  }, []);

  const handleSnoozeAlert = useCallback(async (alertId: string, minutes: number) => {
    setProcessingAlertId(alertId);
    setActionMenuId(null);
    try {
      const result = await snoozeAlert(alertId, minutes);
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, snoozed_until: result.snoozed_until } : a
      ));
    } catch (error) {
      console.error('Failed to snooze alert:', error);
    } finally {
      setProcessingAlertId(null);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [summaryData, alertsData] = await Promise.all([
          getDailySummary(today),
          getAlerts({ date: today, is_active: true }),
        ]);
        setSummary(summaryData);
        setAlerts(alertsData.alerts);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const pendingAlerts = alerts.filter(a => !a.is_completed_today);
  const completedAlerts = alerts.filter(a => a.is_completed_today);

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6F42C1] to-[#8b5cf6] text-white px-4 py-8 md:px-6 md:py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-white/80 text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                {summary?.first_name || 'User'} {summary?.last_name || ''}
              </h1>
              <p className="text-white/70 text-sm mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(new Date())}
              </p>
            </motion.div>
          </div>
          <div className="w-20" />
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
                {(summary?.conditions || []).map((condition, index) => (
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
              {Object.entries(summary?.recent_vitals || {}).map(([name, vital]) => (
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
              {(summary?.medications || []).map((med, index) => (
                <div 
                  key={index} 
                  className={`p-4 ${index < (summary?.medications?.length || 0) - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#6F42C1]/10 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 text-[#6F42C1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{med.name}</p>
                      <p className="text-sm text-gray-500">{med.dosage} • {med.frequency}</p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{med.timing}</span>
                  </div>
                  {med.instructions && (
                    <p className="text-sm text-gray-600 mt-2 ml-14 italic">{med.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Care Plans */}
          <motion.div variants={item}>
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Active Care Plans</h2>
            {(summary?.care_plans || []).map((plan) => (
              <motion.button
                key={plan.plan_id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCarePlanClick(plan.plan_id, plan.name)}
                className="w-full text-left bg-gradient-to-r from-[#6F42C1]/5 to-[#8b5cf6]/5 rounded-2xl p-5 border border-[#6F42C1]/20 mb-4 last:mb-0 hover:border-[#6F42C1]/40 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{plan.status}</Badge>
                    <ChevronRight className="w-5 h-5 text-[#6F42C1]" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#6F42C1]/10">
                  <p className="text-sm text-[#6F42C1] font-medium">
                    Current Phase: {plan.phase}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Today's Tasks */}
          <motion.div variants={item} className="pb-8">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Today's Tasks</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {alerts.map((alert, index) => (
                <div 
                  key={alert.id} 
                  className={`p-4 ${index < alerts.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      alert.is_completed_today ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {processingAlertId === alert.id ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : alert.is_completed_today ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${alert.is_completed_today ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {alert.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {alert.time.join(', ')}
                        {alert.snoozed_until && (
                          <span className="ml-2 text-amber-600">
                            • Snoozed until {new Date(alert.snoozed_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </p>
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
                    {!alert.is_completed_today && (
                      <div className="relative" ref={actionMenuId === alert.id ? menuRef : null}>
                        <button
                          onClick={() => setActionMenuId(actionMenuId === alert.id ? null : alert.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        {actionMenuId === alert.id && (
                          <div className={`absolute right-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[160px] ${
                            index >= alerts.length - 3 ? 'bottom-full mb-1' : 'top-full mt-1'
                          }`}>
                            <button
                              onClick={() => handleCompleteAlert(alert.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                              Mark Complete
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => handleSnoozeAlert(alert.id, 15)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Clock className="w-4 h-4 text-amber-600" />
                              Snooze 15 min
                            </button>
                            <button
                              onClick={() => handleSnoozeAlert(alert.id, 30)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Clock className="w-4 h-4 text-amber-600" />
                              Snooze 30 min
                            </button>
                            <button
                              onClick={() => handleSnoozeAlert(alert.id, 60)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Clock className="w-4 h-4 text-amber-600" />
                              Snooze 1 hour
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Care Plan Detail Modal */}
      <CarePlanDetailModal
        isOpen={selectedPlanId !== null}
        onClose={handleCloseModal}
        planId={selectedPlanId}
        planName={selectedPlanName}
      />
    </div>
  );
}
