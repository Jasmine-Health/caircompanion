import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  Check,
} from 'lucide-react';
import {
  getAlerts,
  completeAlert,
  snoozeAlert,
  type Alert,
} from '../services/healthDataService';
import { formatDate } from '../lib/utils';

const alertFilters = [
  { id: 'all', label: 'All', color: '#6366F1' },
  { id: 'medication', label: 'Medication', color: '#F44336' },
  { id: 'exercise', label: 'Exercise', color: '#4CAF50' },
  { id: 'diet', label: 'Diet', color: '#FF9800' },
  { id: 'monitoring', label: 'Monitoring', color: '#2196F3' },
] as const;

interface AlertsListPageProps {
  title: string;
  subtitle: string;
  alertType?: 'appointment';
  excludeAppointments?: boolean;
}

export function AlertsListPage({
  title,
  subtitle,
  alertType,
  excludeAppointments = false,
}: AlertsListPageProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [showSnoozeModal, setShowSnoozeModal] = useState<Alert | null>(null);
  const [snoozeMinutes, setSnoozeMinutes] = useState(15);

  const dateString = selectedDate.toISOString().split('T')[0];

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { date: string; is_active: boolean; type?: string } = {
        date: dateString,
        is_active: true,
      };
      if (alertType) params.type = alertType;
      const data = await getAlerts(params);
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateString, alertType]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const filteredAlerts = alerts.filter((alert) => {
    if (excludeAppointments && alert.type === 'appointment') return false;
    if (selectedFilter === 'all') return true;
    return alert.type === selectedFilter;
  });

  const changeDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const handleComplete = async (alertId: string) => {
    setProcessingId(alertId);
    setActionMenuId(null);
    try {
      await completeAlert(alertId, dateString);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, is_completed_today: true, completed_dates: [...a.completed_dates, dateString] }
            : a
        )
      );
      setSnackbar('Alert marked as complete');
    } catch {
      setSnackbar('Failed to complete alert');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSnooze = async () => {
    if (!showSnoozeModal) return;
    setProcessingId(showSnoozeModal.id);
    try {
      const result = await snoozeAlert(showSnoozeModal.id, snoozeMinutes);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === showSnoozeModal.id ? { ...a, snoozed_until: result.snoozed_until } : a
        )
      );
      setSnackbar(`Snoozed for ${snoozeMinutes} minutes`);
    } catch {
      setSnackbar('Failed to snooze alert');
    } finally {
      setProcessingId(null);
      setShowSnoozeModal(null);
    }
  };

  useEffect(() => {
    if (snackbar) {
      const t = setTimeout(() => setSnackbar(null), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbar]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl p-3 mb-4 border border-gray-100">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">{formatDate(selectedDate)}</span>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {!alertType && (
          <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar mb-2">
            {alertFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
                style={selectedFilter === filter.id ? { backgroundColor: filter.color } : undefined}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No alerts for this date</p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      alert.is_completed_today ? 'bg-green-100' : 'bg-orange-100'
                    }`}
                  >
                    {processingId === alert.id ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : alert.is_completed_today ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        alert.is_completed_today ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}
                    >
                      {alert.title}
                    </p>
                    {alert.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{alert.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {alert.time.join(', ')}
                      {alert.snoozed_until && (
                        <span className="ml-2 text-amber-600">
                          Snoozed until{' '}
                          {new Date(alert.snoozed_until).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                  {!alert.is_completed_today && (
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === alert.id ? null : alert.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      {actionMenuId === alert.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
                          <button
                            onClick={() => handleComplete(alert.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              setActionMenuId(null);
                              setShowSnoozeModal(alert);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Clock className="w-4 h-4 text-amber-600" />
                            Snooze
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSnoozeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => setShowSnoozeModal(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Snooze Alert</h3>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={snoozeMinutes}
                onChange={(e) => setSnoozeMinutes(Number(e.target.value))}
                className="w-full mb-2"
              />
              <p className="text-center text-gray-600 mb-6">{snoozeMinutes} minutes</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSnoozeModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSnooze}
                  className="flex-1 py-2.5 rounded-xl bg-[#6F42C1] text-white font-medium"
                >
                  Snooze
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export function AlertsPage() {
  return (
    <AlertsListPage
      title="Alerts"
      subtitle="View your reminders & notifications"
      excludeAppointments
    />
  );
}

export function AppointmentsPage() {
  return (
    <AlertsListPage
      title="Appointments"
      subtitle="View and manage your appointments"
      alertType="appointment"
    />
  );
}
