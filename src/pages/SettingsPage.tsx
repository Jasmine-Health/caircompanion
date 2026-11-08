import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Volume2,
  LogOut,
  Play,
  Check,
  Eye,
  EyeOff,
  X,
  Settings,
  Building2,
  Bell,
  Mail,
  Sun,
  Moon,
  Monitor,
  History,
  Cloud,
  Phone,
  FileText,
  Info,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Badge } from '../components/ui';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingsRow } from '../components/settings/SettingsRow';
import { SettingsToggleRow } from '../components/settings/SettingsToggleRow';
import { MedicalDisclaimer } from '../components/settings/MedicalDisclaimer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../contexts/OrganizationContext';
import { APIError } from '../config/api';
import { changePassword, deleteAccount } from '../services/authService';
import {
  getVoiceSample,
  getVoiceModels,
  getCachedVoiceModel,
  resolveUserVoiceModel,
  updateUserVoiceModel,
} from '../services/voiceService';
import type { VoiceModel } from '../types';

type ThemeMode = 'light' | 'dark' | 'system';
const THEME_STORAGE_KEY = 'caircompanion-theme';

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
  const [savedVoice, setSavedVoice] = useState(getCachedVoiceModel);
  const [pendingVoice, setPendingVoice] = useState(getCachedVoiceModel);
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isLoadingVoice, setIsLoadingVoice] = useState<string | null>(null);
  const [isSavingVoice, setIsSavingVoice] = useState(false);
  const [voiceSaveError, setVoiceSaveError] = useState('');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wipeOutCompletely, setWipeOutCompletely] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = themeMode === 'dark' || (themeMode === 'system' && prefersDark);
    root.classList.toggle('dark', useDark);
  }, [themeMode]);

  useEffect(() => {
    let cancelled = false;

    const loadVoicePreference = async () => {
      try {
        const models = await getVoiceModels();
        if (!cancelled) setVoiceModels(models);
      } catch (error) {
        console.error('Failed to load voice models:', error);
      }

      try {
        const model = await resolveUserVoiceModel();
        if (!cancelled) {
          setSavedVoice(model);
          setPendingVoice(model);
        }
      } catch (error) {
        console.error('Failed to load voice settings:', error);
      }
    };

    loadVoicePreference();
    return () => {
      cancelled = true;
    };
  }, []);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!passwordSuccess) return;
    const timer = window.setTimeout(() => setPasswordSuccess(null), 6000);
    return () => window.clearTimeout(timer);
  }, [passwordSuccess]);

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
      const response = await changePassword({ old_password: oldPassword, new_password: newPassword });
      const successMessage =
        response.message?.trim() || 'Password changed successfully.';
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess(successMessage);
    } catch (err) {
      if (err instanceof APIError) {
        setPasswordError(err.message || 'Failed to change password. Please try again.');
      } else {
        setPasswordError('Failed to change password. Please check your current password and try again.');
      }
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

  const stopVoicePreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVoice(null);
    setIsLoadingVoice(null);
  };

  const openVoiceModal = () => {
    setPendingVoice(savedVoice);
    setVoiceSaveError('');
    setShowVoiceModal(true);
  };

  const closeVoiceModal = () => {
    if (isSavingVoice) return;
    stopVoicePreview();
    setPendingVoice(savedVoice);
    setVoiceSaveError('');
    setShowVoiceModal(false);
  };

  const handleSelectVoice = (modelId: string) => {
    setPendingVoice(modelId);
    setVoiceSaveError('');
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError('');
    try {
      await deleteAccount(wipeOutCompletely);
      setShowDeleteDialog(false);
      logout();
    } catch {
      setDeleteAccountError('Failed to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const confirmVoiceSelection = async () => {
    if (!pendingVoice || pendingVoice === savedVoice || isSavingVoice) return;

    setIsSavingVoice(true);
    setVoiceSaveError('');
    stopVoicePreview();

    try {
      const saved = await updateUserVoiceModel(pendingVoice);
      setSavedVoice(saved);
      setPendingVoice(saved);
      setShowVoiceModal(false);
    } catch (error) {
      console.error('Failed to save voice model:', error);
      setVoiceSaveError('Failed to save voice selection. Please try again.');
    } finally {
      setIsSavingVoice(false);
    }
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
          <motion.div variants={item}>
            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center text-white text-xl font-bold">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
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

          {passwordSuccess && (
            <motion.div
              variants={item}
              className="p-4 rounded-xl bg-green-50 text-green-800 text-sm border border-green-100 flex gap-3 justify-between items-start"
              role="status"
            >
              <span>{passwordSuccess}</span>
              <button
                type="button"
                className="shrink-0 text-green-700 hover:text-green-900"
                onClick={() => setPasswordSuccess(null)}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          <motion.div variants={item}>
            <Card>
              <CardContent className="p-0">
                <SettingsRow
                  icon={Lock}
                  title="Change Password"
                  subtitle="Update your account password"
                  iconClassName="bg-blue-100 text-blue-600"
                  onClick={() => {
                    setPasswordError('');
                    setShowPasswordModal(true);
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="Appearance">
              <ThemeOption
                icon={Sun}
                label="Light"
                selected={themeMode === 'light'}
                onSelect={() => setThemeMode('light')}
              />
              <ThemeOption
                icon={Moon}
                label="Dark"
                selected={themeMode === 'dark'}
                onSelect={() => setThemeMode('dark')}
              />
              <ThemeOption
                icon={Monitor}
                label="System"
                selected={themeMode === 'system'}
                onSelect={() => setThemeMode('system')}
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="Notifications">
              <SettingsToggleRow
                icon={Bell}
                title="Push Notifications"
                enabled={pushNotifications}
                onChange={setPushNotifications}
                iconClassName="bg-amber-100 text-amber-700"
              />
              <SettingsToggleRow
                icon={Mail}
                title="Email Notifications"
                enabled={emailNotifications}
                onChange={setEmailNotifications}
                iconClassName="bg-sky-100 text-sky-700"
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="Voice">
              <SettingsRow
                icon={Volume2}
                title="Assistant Voice"
                subtitle={voiceModels.find((v) => v.model === savedVoice)?.name || 'Vesta'}
                iconClassName="bg-purple-100 text-purple-600"
                onClick={openVoiceModal}
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="Organization">
              <SettingsRow
                icon={Building2}
                title="Organizations"
                subtitle={selectedOrganization?.name || 'Manage your organizations'}
                iconClassName="bg-green-100 text-green-600"
                onClick={() => navigate('/organizations')}
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="Access data">
              <SettingsRow
                icon={History}
                title="Access Data"
                subtitle="Who accessed your data"
                iconClassName="bg-gray-100 text-gray-700"
                onClick={() => window.alert('Access history is coming soon to the web app.')}
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="Connect services">
              <SettingsRow
                icon={Cloud}
                title="Connect Services"
                subtitle="Sync your EHR data"
                iconClassName="bg-indigo-100 text-indigo-600"
                onClick={() => navigate('/connectors')}
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="Notifications & contact">
              <SettingsRow
                icon={Phone}
                title="Notifications & Contact"
                subtitle="Manage how we reach you"
                iconClassName="bg-teal-100 text-teal-700"
                onClick={() => window.alert('Notification preferences are coming soon to the web app.')}
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="Privacy">
              <SettingsRow
                icon={Lock}
                title="Data Sharing"
                subtitle="Control what health data is shared"
                iconClassName="bg-rose-100 text-rose-700"
                onClick={() => window.alert('Data sharing controls are coming soon to the web app.')}
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <SettingsSection title="About">
              <SettingsRow
                icon={Info}
                title="Version"
                subtitle="1.0.0"
                iconClassName="bg-gray-100 text-gray-700"
                showChevron={false}
              />
              <SettingsRow
                icon={FileText}
                title="Privacy Policy"
                iconClassName="bg-gray-100 text-gray-700"
                onClick={() => window.open('https://cairiq.com/privacy', '_blank', 'noopener,noreferrer')}
              />
              <SettingsRow
                icon={FileText}
                title="Terms of Service"
                iconClassName="bg-gray-100 text-gray-700"
                onClick={() => window.open('https://cairiq.com/terms', '_blank', 'noopener,noreferrer')}
              />
            </SettingsSection>
          </motion.div>

          <motion.div variants={item}>
            <MedicalDisclaimer />
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <Button variant="danger" className="w-full" onClick={() => setShowLogoutDialog(true)}>
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                setWipeOutCompletely(false);
                setDeleteAccountError('');
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Account
            </Button>
          </motion.div>

          <motion.div variants={item} className="text-center text-sm text-gray-400 pt-2 pb-6">
            <p>© {new Date().getFullYear()} CairCompanion. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </main>

      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  setShowLogoutDialog(false);
                  logout();
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
            <label className="flex items-start gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={wipeOutCompletely}
                disabled={isDeletingAccount}
                onChange={(e) => setWipeOutCompletely(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-800">Permanently wipe out all data</span>
            </label>
            {wipeOutCompletely && (
              <p className="text-xs text-red-600 font-medium mb-4">
                This will permanently remove all your data from our servers. Recovery will be impossible.
              </p>
            )}
            {deleteAccountError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm mb-4">{deleteAccountError}</div>
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={isDeletingAccount}
                onClick={() => {
                  if (!isDeletingAccount) {
                    setShowDeleteDialog(false);
                    setWipeOutCompletely(false);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                isLoading={isDeletingAccount}
                onClick={handleDeleteAccount}
              >
                {wipeOutCompletely ? 'Wipe Out Account' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
            onClick={closeVoiceModal}
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
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assistant Voice</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Tap a voice to preview, then confirm</p>
                </div>
                <button
                  onClick={closeVoiceModal}
                  disabled={isSavingVoice}
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
                      pendingVoice === voice.model
                        ? 'border-[#6F42C1] bg-[#6F42C1]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectVoice(voice.model)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        pendingVoice === voice.model ? 'bg-[#6F42C1]' : 'bg-gray-100'
                      }`}>
                        <Volume2 className={`w-6 h-6 ${
                          pendingVoice === voice.model ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{voice.name}</p>
                          {pendingVoice === voice.model && (
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

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 space-y-2">
                {voiceSaveError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{voiceSaveError}</div>
                )}
                <Button
                  className="w-full"
                  onClick={confirmVoiceSelection}
                  disabled={!pendingVoice || pendingVoice === savedVoice}
                  isLoading={isSavingVoice}
                >
                  <Check className="w-5 h-5 mr-2" />
                  {isSavingVoice ? 'Saving...' : 'Confirm'}
                </Button>
                {pendingVoice === savedVoice && (
                  <p className="text-center text-sm text-gray-500">This voice is already selected</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  label,
  selected,
  onSelect,
}: {
  icon: typeof Sun;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
    >
      <Icon className="w-5 h-5 text-gray-700" />
      <span className="flex-1 font-medium text-gray-900">{label}</span>
      {selected ? <Check className="w-5 h-5 text-[#6F42C1]" /> : null}
    </button>
  );
}
