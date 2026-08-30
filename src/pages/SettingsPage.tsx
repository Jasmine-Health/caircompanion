import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Volume2, 
  LogOut, 
  ChevronRight,
  Play,
  Check,
  Eye,
  EyeOff,
  X,
  Settings,
  Building2
} from 'lucide-react';
import { Card, CardContent, Button, Input, Badge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../contexts/OrganizationContext';
import { changePassword } from '../services/authService';
import { getVoiceSample, getVoiceModels } from '../services/voiceService';
import type { VoiceModel } from '../types';

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

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganization();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('aura-2-thalia-en');
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isLoadingVoice, setIsLoadingVoice] = useState<string | null>(null);

  // Fetch voice models on component mount
  useEffect(() => {
    const loadVoiceModels = async () => {
      try {
        const models = await getVoiceModels();
        setVoiceModels(models);
      } catch (error) {
        console.error('Failed to load voice models:', error);
      }
    };

    loadVoiceModels();
  }, []);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError('Failed to change password. Please check your current password and try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePlayVoice = async (modelId: string) => {
    // Stop currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same voice that's playing, just stop it
    if (playingVoice === modelId) {
      setPlayingVoice(null);
      return;
    }

    // Play new voice sample
    setPlayingVoice(modelId);
    setIsLoadingVoice(modelId);

    try {
      const audioBlob = await getVoiceSample(modelId);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingVoice(null);
        setIsLoadingVoice(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setPlayingVoice(null);
        setIsLoadingVoice(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      setIsLoadingVoice(null);
    } catch (error) {
      console.error('Failed to play voice sample:', error);
      setPlayingVoice(null);
      setIsLoadingVoice(null);
    }
  };

  const handleSelectVoice = (modelId: string) => {
    setSelectedVoice(modelId);
  };

  return (
    <div className="bg-gray-50">
      {/* Header - hidden on mobile, shown on desktop */}
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-500 mt-1">Manage your preferences</p>
            </div>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Profile Section */}
          <motion.div variants={item}>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Account</h2>
            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center text-white text-xl font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Options */}
          <motion.div variants={item}>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Preferences</h2>
            <Card>
              <CardContent className="p-0">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => setShowVoiceModal(true)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Voice Model</p>
                    <p className="text-sm text-gray-500">
                      {voiceModels.find(v => v.model === selectedVoice)?.name || 'Select a voice'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => navigate('/organizations')}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Organizations</p>
                    <p className="text-sm text-gray-500">
                      {selectedOrganization?.name || 'Manage your organizations'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Logout */}
          <motion.div variants={item}>
            <Button
              variant="danger"
              className="w-full"
              onClick={logout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </motion.div>

          {/* App Info */}
          <motion.div variants={item} className="text-center text-sm text-gray-400 pt-4">
            <p>CairCompanion v1.0.0</p>
            <p className="mt-1">© 2024 CairCompanion. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </main>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => !isChangingPassword && setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                    {passwordError}
                  </div>
                )}

                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={isChangingPassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isChangingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Model Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => setShowVoiceModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl overflow-hidden"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Voice Model</h2>
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {voiceModels.map((voice) => (
                  <motion.div
                    key={voice.model}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedVoice === voice.model
                        ? 'border-[#6F42C1] bg-[#6F42C1]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectVoice(voice.model)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedVoice === voice.model ? 'bg-[#6F42C1]' : 'bg-gray-100'
                      }`}>
                        <Volume2 className={`w-6 h-6 ${
                          selectedVoice === voice.model ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{voice.name}</p>
                          {selectedVoice === voice.model && (
                            <Badge variant="success">Selected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{voice.characteristics}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default">{voice.gender}</Badge>
                          <Badge variant="default">{voice.accent}</Badge>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVoice(voice.model);
                        }}
                        disabled={isLoadingVoice === voice.model}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          playingVoice === voice.model
                            ? 'bg-[#6F42C1] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } ${isLoadingVoice === voice.model ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoadingVoice === voice.model ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : playingVoice === voice.model ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            <Volume2 className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                <Button
                  className="w-full"
                  onClick={() => setShowVoiceModal(false)}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
