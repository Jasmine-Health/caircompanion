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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg md:max-w-2xl max-h-[80vh] flex flex-col shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#6F42C1]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-[#6F42C1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {carePlan?.name || planName || 'Care Plan Details'}
                  </h2>
                  {carePlan?.type && (
                    <p className="text-xs text-gray-500 truncate">{carePlan.type}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
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
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#6F42C1] text-white font-semibold rounded-xl hover:bg-[#5a32a3] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[#6F42C1] focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
