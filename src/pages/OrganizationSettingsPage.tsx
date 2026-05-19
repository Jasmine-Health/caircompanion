import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  LogOut as Unenroll,
  X,
  ArrowLeftRight
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '../components/ui';
import { useOrganization } from '../contexts/OrganizationContext';

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

export function OrganizationSettingsPage() {
  const {
    selectedOrganization,
    userOrganizations,
    availableOrganizations,
    switchOrganization,
    enrollInOrganization,
    unenrollFromOrganization,
  } = useOrganization();

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedOrgToUnenroll, setSelectedOrgToUnenroll] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const enrolledOrgIds = userOrganizations.map(uo => uo.organization.id);
  const unenrolledOrganizations = availableOrganizations.filter(
    org => !enrolledOrgIds.includes(org.id)
  );

  const handleEnroll = async (orgId: string) => {
    setIsProcessing(true);
    await enrollInOrganization(orgId);
    setIsProcessing(false);
    setShowEnrollModal(false);
  };

  const handleUnenroll = async () => {
    if (!selectedOrgToUnenroll) return;
    setIsProcessing(true);
    await unenrollFromOrganization(selectedOrgToUnenroll);
    setIsProcessing(false);
    setShowUnenrollModal(false);
    setSelectedOrgToUnenroll(null);
  };

  const openUnenrollModal = (orgId: string) => {
    setSelectedOrgToUnenroll(orgId);
    setShowUnenrollModal(true);
  };

  return (
    <div className="bg-gray-50">
      {/* Header - hidden on mobile, shown on desktop */}
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
              <p className="text-gray-500 mt-1">Manage your organization memberships</p>
            </div>
          </div>
          {unenrolledOrganizations.length > 0 && (
            <Button onClick={() => setShowEnrollModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Enroll
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Mobile enroll button */}
        <div className="md:hidden mb-4">
          {unenrolledOrganizations.length > 0 && (
            <Button variant="outline" onClick={() => setShowEnrollModal(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Enroll in Organization
            </Button>
          )}
        </div>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Current Organization */}
          <motion.div variants={item}>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Current Organization
            </h2>
            <Card>
              <CardContent>
                {selectedOrganization ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedOrganization.logo}
                      alt={selectedOrganization.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-lg">
                          {selectedOrganization.name}
                        </p>
                        <Badge variant="success">Active</Badge>
                      </div>
                      {selectedOrganization.description && (
                        <p className="text-gray-500 mt-1">{selectedOrganization.description}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No organization selected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Enrolled Organizations */}
          <motion.div variants={item}>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Your Organizations
            </h2>
            <Card>
              <CardContent className="p-0">
                {userOrganizations.length > 0 ? (
                  userOrganizations.map((userOrg, index) => (
                    <div
                      key={userOrg.organization.id}
                      className={`p-4 ${
                        index !== userOrganizations.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={userOrg.organization.logo}
                          alt={userOrg.organization.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                            <p className="font-medium text-gray-900 truncate">{userOrg.organization.name}</p>
                            {selectedOrganization?.id === userOrg.organization.id && (
                              <Badge variant="success">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Enrolled {new Date(userOrg.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 hidden md:flex">
                          {selectedOrganization?.id !== userOrg.organization.id && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => switchOrganization(userOrg.organization.id)}
                            >
                              <ArrowLeftRight className="w-4 h-4 mr-1" />
                              Switch
                            </Button>
                          )}
                          <button
                            onClick={() => openUnenrollModal(userOrg.organization.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Unenroll"
                          >
                            <Unenroll className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-end mt-3 md:hidden">
                        {selectedOrganization?.id !== userOrg.organization.id && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => switchOrganization(userOrg.organization.id)}
                          >
                            <ArrowLeftRight className="w-4 h-4 mr-1" />
                            Switch
                          </Button>
                        )}
                        <button
                          onClick={() => openUnenrollModal(userOrg.organization.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Unenroll"
                        >
                          <Unenroll className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">You are not enrolled in any organizations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>


        </motion.div>
      </main>

      {/* Enroll Modal */}
      <AnimatePresence>
        {showEnrollModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50"
            onClick={() => !isProcessing && setShowEnrollModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Available Organizations</h2>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-3 pb-safe">
                {unenrolledOrganizations.map((org) => (
                  <motion.button
                    key={org.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEnroll(org.id)}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#6F42C1]/30 hover:bg-[#6F42C1]/5 transition-all disabled:opacity-50"
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
                    <Plus className="w-5 h-5 text-[#6F42C1]" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unenroll Confirmation Modal */}
      <AnimatePresence>
        {showUnenrollModal && selectedOrgToUnenroll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => !isProcessing && setShowUnenrollModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Unenroll className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Unenroll from Organization?</h2>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to unenroll from{' '}
                  <span className="font-medium text-gray-900">
                    {userOrganizations.find(uo => uo.organization.id === selectedOrgToUnenroll)?.organization.name}
                  </span>
                  ? You can re-enroll at any time.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowUnenrollModal(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={handleUnenroll}
                    isLoading={isProcessing}
                  >
                    Unenroll
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
