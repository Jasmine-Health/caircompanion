import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Activity, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCarePlanDetail, type CarePlanDetail } from '../services/healthDataService';
import { Badge } from './ui';

interface CarePlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string | null;
  planName?: string;
}

export function CarePlanDetailModal({ isOpen, onClose, planId, planName }: CarePlanDetailModalProps) {
  const [carePlan, setCarePlan] = useState<CarePlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && planId) {
      setIsLoading(true);
      setError(null);
      getCarePlanDetail(planId)
        .then((data) => {
          setCarePlan(data);
        })
        .catch((err) => {
          console.error('Failed to load care plan details:', err);
          setError('Failed to load care plan details');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setCarePlan(null);
      setError(null);
    }
  }, [isOpen, planId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg md:max-w-2xl max-h-[70vh] md:max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#6F42C1] to-[#8b5cf6] text-white px-6 py-5 pr-14">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate">
                    {carePlan?.name || planName || 'Care Plan Details'}
                  </h3>
                  {carePlan?.type && (
                    <p className="text-white/80 text-sm truncate">{carePlan.type}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#6F42C1] animate-spin" />
                  <p className="text-gray-500 mt-3">Loading care plan...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-gray-600 font-medium">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-sm text-[#6F42C1] font-medium hover:underline"
                  >
                    Close
                  </button>
                </div>
              ) : carePlan ? (
                <div className="space-y-5">
                  {/* Status & Phase */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={carePlan.status === 'active' ? 'success' : 'default'}>
                      {carePlan.status}
                    </Badge>
                    {carePlan.phase && (
                      <span className="text-sm text-[#6F42C1] font-medium bg-[#6F42C1]/10 px-3 py-1 rounded-full">
                        {carePlan.phase}
                      </span>
                    )}
                    {carePlan.plan_type && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {carePlan.plan_type}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {carePlan.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{carePlan.description}</p>
                    </div>
                  )}

                  {/* Instructions */}
                  {carePlan.instructions && carePlan.instructions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Instructions</h4>
                      <div className="space-y-4">
                        {carePlan.instructions.map((instruction, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-lg bg-[#6F42C1]/10 flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-[#6F42C1]" />
                              </div>
                              <h5 className="font-semibold text-gray-900 text-sm">
                                {instruction.title}
                              </h5>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                              {instruction.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  {carePlan.activities && carePlan.activities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Activities</h4>
                      <div className="space-y-3">
                        {carePlan.activities.map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                              <Activity className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-gray-700 text-sm">
                              {typeof activity === 'string' ? activity : JSON.stringify(activity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for no instructions/activities */}
                  {(!carePlan.instructions || carePlan.instructions.length === 0) &&
                    (!carePlan.activities || carePlan.activities.length === 0) &&
                    !carePlan.description && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No additional details available for this care plan.</p>
                      </div>
                    )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#6F42C1] text-white font-semibold rounded-xl hover:bg-[#5a32a3] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[#6F42C1] focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
