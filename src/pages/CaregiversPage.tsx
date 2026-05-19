import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Check, 
  X, 
  Users,
  Clock,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Card, CardContent, Button, Input, Avatar, Badge } from '../components/ui';
import { mockCaregivers, mockPendingRequests } from '../data/mockData';

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

export function CaregiversPage() {
  const [caregivers] = useState(mockCaregivers);
  const [pendingRequests, setPendingRequests] = useState(mockPendingRequests);
  const [email, setEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    setEmail('');
    
    setTimeout(() => {
      setShowSuccess(false);
      setShowInviteForm(false);
    }, 2000);
  };

  const handleAccept = (id: string) => {
    setPendingRequests(prev => prev.filter(r => r.relationship_id !== id));
  };

  const handleReject = (id: string) => {
    setPendingRequests(prev => prev.filter(r => r.relationship_id !== id));
  };

  return (
    <div className="bg-gray-50">
      {/* Header - hidden on mobile, shown on desktop */}
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Caregivers</h1>
              <p className="text-gray-500 mt-1">Manage your care team</p>
            </div>
          </div>
          <Button onClick={() => setShowInviteForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Invite Form Modal */}
          <AnimatePresence>
            {showInviteForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                onClick={() => !isSubmitting && setShowInviteForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                >
                  {showSuccess ? (
                    <div className="text-center py-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900">Invitation Sent!</h3>
                      <p className="text-gray-500 mt-1">They'll receive an email shortly</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Invite Caregiver</h2>
                      <p className="text-gray-500 mb-6">Send an invitation to add a caregiver to your care team</p>
                      
                      <form onSubmit={handleInvite}>
                        <Input
                          label="Email Address"
                          type="email"
                          placeholder="caregiver@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          icon={<Mail className="w-5 h-5" />}
                          required
                        />
                        
                        <div className="flex gap-3 mt-6">
                          <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowInviteForm(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            isLoading={isSubmitting}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Invite
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <motion.div variants={item}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900">Pending Requests</h2>
                <Badge variant="warning">{pendingRequests.length}</Badge>
              </div>
              <Card>
                <CardContent className="divide-y divide-gray-100">
                  {pendingRequests.map((request, index) => (
                    <motion.div
                      key={request.relationship_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center gap-4 ${index > 0 ? 'pt-4' : ''} ${index < pendingRequests.length - 1 ? 'pb-4' : ''}`}
                    >
                      <Avatar name={request.name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{request.name}</p>
                        <p className="text-sm text-gray-500 truncate">{request.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAccept(request.relationship_id)}
                          className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReject(request.relationship_id)}
                          className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Connected Caregivers */}
          <motion.div variants={item}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-[#6F42C1]" />
              <h2 className="font-semibold text-gray-900">Connected Caregivers</h2>
              <Badge variant="info">{caregivers.length}</Badge>
            </div>
            
            {caregivers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">No caregivers yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Invite family members or caregivers to join your care team
                  </p>
                  <Button onClick={() => setShowInviteForm(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Caregiver
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="divide-y divide-gray-100">
                  {caregivers.map((caregiver, index) => (
                    <div
                      key={caregiver.relationship_id}
                      className={`flex items-center gap-4 ${index > 0 ? 'pt-4' : ''} ${index < caregivers.length - 1 ? 'pb-4' : ''}`}
                    >
                      <Avatar name={caregiver.cairgiver_name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{caregiver.cairgiver_name}</p>
                        <p className="text-sm text-gray-500 truncate">{caregiver.cairgiver_email}</p>
                      </div>
                      <Badge variant="success">Connected</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
