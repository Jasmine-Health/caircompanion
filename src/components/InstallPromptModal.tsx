import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Monitor, Download, ArrowUpRight } from 'lucide-react';
import type { PWAPlatform } from '../hooks/usePWAInstall';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: PWAPlatform;
}

export function InstallPromptModal({ isOpen, onClose, platform }: InstallPromptModalProps) {
  // Safari Share SVG
  const SafariShareIcon = () => (
    <span className="inline-flex items-center justify-center p-1.5 bg-gray-100 rounded-lg mx-1 border border-gray-200">
      <svg className="w-5 h-5 text-[#007AFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </span>
  );

  // Safari Add to Home Screen Plus SVG
  const SafariAddIcon = () => (
    <span className="inline-flex items-center justify-center p-1.5 bg-gray-100 rounded-lg mx-1 border border-gray-200">
      <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </span>
  );

  // Three dots menu SVG
  const ThreeDotsIcon = () => (
    <span className="inline-flex items-center justify-center p-1 bg-gray-100 rounded-lg mx-1 border border-gray-200">
      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
      </svg>
    </span>
  );

  const renderContent = () => {
    switch (platform) {
      case 'ios':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-[#6F42C1]/5 rounded-2xl flex items-start gap-3 text-sm text-gray-600">
              <Smartphone className="w-5 h-5 text-[#6F42C1] shrink-0 mt-0.5" />
              <p>
                To install <strong className="text-gray-900 font-semibold">CairCompanion</strong> on your iOS device, please follow these simple steps using the <strong className="text-gray-900 font-semibold">Safari browser</strong>.
              </p>
            </div>
            
            <ol className="space-y-4 text-gray-600 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  Tap the <strong className="text-gray-900">Share</strong> button <SafariShareIcon /> in Safari's bottom toolbar.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  Scroll down the menu list and select <strong className="text-gray-900">Add to Home Screen</strong> <SafariAddIcon />.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  Tap <strong className="text-gray-900">Add</strong> in the top-right corner to complete the installation.
                </div>
              </li>
            </ol>

            <div className="pt-2 text-xs text-gray-400 italic">
              Note: Third-party browsers (like Chrome or Firefox on iOS) do not support direct home-screen installation. Please copy this page link and open it in Safari if needed.
            </div>
          </div>
        );

      case 'android':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-[#6F42C1]/5 rounded-2xl flex items-start gap-3 text-sm text-gray-600">
              <Smartphone className="w-5 h-5 text-[#6F42C1] shrink-0 mt-0.5" />
              <p>
                Install <strong className="text-gray-900 font-semibold">CairCompanion</strong> on your Android device to run it as a lightweight native app.
              </p>
            </div>
            
            <ol className="space-y-4 text-gray-600 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  Tap the browser menu <ThreeDotsIcon /> (three dots in the top-right corner).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  Tap <strong className="text-gray-900">Install app</strong> or <strong className="text-gray-900">Add to Home screen</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  Follow the on-screen prompt to confirm installation.
                </div>
              </li>
            </ol>
          </div>
        );

      case 'desktop':
      default:
        return (
          <div className="space-y-4">
            <div className="p-3 bg-[#6F42C1]/5 rounded-2xl flex items-start gap-3 text-sm text-gray-600">
              <Monitor className="w-5 h-5 text-[#6F42C1] shrink-0 mt-0.5" />
              <p>
                Install <strong className="text-gray-900 font-semibold">CairCompanion</strong> on your computer for an app-like standalone window experience.
              </p>
            </div>
            
            <ol className="space-y-4 text-gray-600 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  Look at the right side of the address bar at the top of your browser for the <strong className="text-gray-900">Install</strong> icon <ArrowUpRight className="w-4 h-4 inline-block text-gray-500" /> or a plus <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono text-xs">+</span>.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  Click the install icon and confirm by choosing <strong className="text-gray-900">Install</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6F42C1]/10 text-[#6F42C1] font-semibold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  Alternatively, click the browser menu <ThreeDotsIcon /> in the top right, and select <strong className="text-gray-900">Install CairCompanion...</strong>.
                </div>
              </li>
            </ol>
          </div>
        );
    }
  };

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
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col border border-gray-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-[#6F42C1]/10 to-[#8b5cf6]/10 rounded-2xl mb-4">
                <img src="/logo.png" alt="CairCompanion" className="w-14 h-14 object-contain mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Download className="w-5 h-5 text-[#6F42C1]" />
                Install CairCompanion
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Access your health companion directly from your home screen
              </p>
            </div>

            {/* Platform Instructions */}
            <div className="flex-1">
              {renderContent()}
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#6F42C1] text-white font-semibold rounded-xl hover:bg-[#5a32a3] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[#6F42C1] focus:ring-offset-2"
              >
                Got It, Thanks!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
