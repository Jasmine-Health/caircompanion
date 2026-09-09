import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import {
  type TrackerObservation,
} from '../services/healthDataService';
import { formatTime, formatDateTime } from '../lib/utils';
import { APIError } from '../config/api';
import { Button } from './ui';

type TrackerFetcher = (params: { start_date?: string; end_date?: string }) => Promise<{
  observations: TrackerObservation[];
}>;

interface TrackerObservationsPageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  fetchData: TrackerFetcher;
  showDateTime?: boolean;
  /** iOS tracker v2 APIs load without date filters by default */
  useDateRange?: boolean;
}

export function TrackerObservationsPage({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
  fetchData,
  showDateTime = false,
  useDateRange = true,
}: TrackerObservationsPageProps) {
  const [observations, setObservations] = useState<TrackerObservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { start_date?: string; end_date?: string } = {};
      if (useDateRange) {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date();
        start.setDate(start.getDate() - 30);
        params.start_date = start.toISOString().split('T')[0];
        params.end_date = end;
      }
      const data = await fetchData(params);
      setObservations(data.observations ?? []);
    } catch (err) {
      console.error(`Failed to load ${title}:`, err);
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Unable to load records right now. Please try again.');
      }
      setObservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, title, useDateRange]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        {error ? (
          <div className="text-center py-16 px-4">
            <Icon className={`w-12 h-12 mx-auto mb-3 ${iconColor} opacity-40`} />
            <p className="text-gray-700 font-medium mb-2">Could not load {title.toLowerCase()}</p>
            <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">{error}</p>
            <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </div>
        ) : observations.length === 0 ? (
          <div className="text-center py-16">
            <Icon className={`w-12 h-12 mx-auto mb-3 ${iconColor} opacity-40`} />
            <p className="text-gray-500">No records found</p>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {observations.map((obs) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{obs.display}</p>
                    <p className="text-sm text-gray-500">
                      {obs.value_string || obs.value}
                      {obs.unit ? ` ${obs.unit}` : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {obs.source} •{' '}
                      {showDateTime
                        ? formatDateTime(obs.effective_date || obs.recorded_at)
                        : formatTime(obs.effective_date || obs.recorded_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      obs.status === 'final' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {obs.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
