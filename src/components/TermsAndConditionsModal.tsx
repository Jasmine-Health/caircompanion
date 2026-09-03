import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIVACY_POLICY_URL = 'https://pulpdigital.ai/privacy-policy.html';
const TERMS_OF_SERVICE_URL = 'https://pulpdigital.ai/terms.html';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing and using CairCompanion, you accept and agree to be bound by the terms and provision of this agreement.',
  },
  {
    title: '2. SMS Communications',
    body: 'By providing your phone number and agreeing to receive SMS messages, you consent to receive text messages from CairCompanion related to your health reminders, appointments, and important notifications. Message and data rates may apply. You can opt out at any time by updating your preferences in the app settings.',
  },
  {
    title: '3. Privacy Policy',
    body: 'Your privacy is important to us. We collect and use your personal information only as described in our Privacy Policy. We do not sell or share your personal information with third parties for marketing purposes.',
  },
  {
    title: '4. Health Information',
    body: 'CairCompanion is designed to help you manage your health information and reminders. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
  },
  {
    title: '5. User Responsibilities',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
  },
  {
    title: '6. Contact Us',
    body: 'If you have any questions about these Terms and Conditions, please contact us at support@cairiqhealth.ai',
  },
];

export function TermsAndConditionsModal({ isOpen, onClose }: TermsAndConditionsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.button
            type="button"
            aria-label="Close terms"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Terms and Conditions</h2>
              <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-5">
              <p className="text-sm text-gray-500">Last updated: January 2025</p>
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
                </div>
              ))}

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-800 mb-3">
                  For more information, please review our:
                </p>
                <ul className="space-y-2">
                  <li>
                    <a
                      href={PRIVACY_POLICY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#6F42C1] underline hover:text-[#5a32a3]"
                    >
                      • Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href={TERMS_OF_SERVICE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#6F42C1] underline hover:text-[#5a32a3]"
                    >
                      • Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#6F42C1] text-white font-semibold hover:bg-[#5a32a3] transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
