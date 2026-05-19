import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ChevronRight } from 'lucide-react';
import { useOrganization } from '../../contexts/OrganizationContext';

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

export function OrganizationSelectionPage() {
  const navigate = useNavigate();
  const { availableOrganizations, selectOrganization } = useOrganization();

  const handleSelectOrganization = (org: typeof availableOrganizations[0]) => {
    selectOrganization(org);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6F42C1]/5 via-white to-[#8b5cf6]/5 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-4"
            >
              <img src="/logo.png" alt="CairCompanion" className="w-20 h-20 mx-auto" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to CairCompanion</h1>
            <p className="text-gray-500 mt-1">Select your organization to continue</p>
          </div>

          {/* Organization List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-xl bg-[#6F42C1]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#6F42C1]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Organizations</h2>
                <p className="text-sm text-gray-500">Choose your healthcare provider</p>
              </div>
            </div>

            <div className="space-y-2">
              {availableOrganizations.map((org) => (
                <motion.button
                  key={org.id}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectOrganization(org)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#6F42C1]/30 hover:bg-[#6F42C1]/5 transition-all"
                >
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{org.name}</p>
                    {org.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{org.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-sm text-gray-500">
        © 2024 CairCompanion. All rights reserved.
      </div>
    </div>
  );
}
