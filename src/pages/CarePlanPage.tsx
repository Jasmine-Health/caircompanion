import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ChevronRight, Eye } from 'lucide-react';
import { getCarePlans, type CarePlan } from '../services/healthDataService';
import { CarePlanDetailModal } from '../components/CarePlanDetailModal';
import { Badge } from '../components/ui';

export function CarePlanPage() {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string | undefined>();

  useEffect(() => {
    getCarePlans()
      .then((data) => setCarePlans(data.care_plans))
      .catch((err) => console.error('Failed to load care plans:', err))
      .finally(() => setIsLoading(false));
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Care Plans</h1>
          <p className="text-sm text-gray-500 mt-1">View your active care plans and instructions</p>
        </div>

        {carePlans.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No care plans available</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {carePlans.map((plan) => (
              <motion.button
                key={plan.plan_id}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setSelectedPlanId(plan.plan_id);
                  setSelectedPlanName(plan.name);
                }}
                className="w-full text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-[#6F42C1]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.type}</p>
                    <p className="text-sm text-[#6F42C1] font-medium mt-3">
                      Current Phase: {plan.phase}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{plan.status}</Badge>
                    <Eye className="w-5 h-5 text-[#6F42C1]" />
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3 text-sm text-[#6F42C1] font-medium">
                  View Details <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <CarePlanDetailModal
        isOpen={selectedPlanId !== null}
        onClose={() => {
          setSelectedPlanId(null);
          setSelectedPlanName(undefined);
        }}
        planId={selectedPlanId}
        planName={selectedPlanName}
      />
    </div>
  );
}
