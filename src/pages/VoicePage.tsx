import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Download, Volume2, Loader2, WifiOff, AudioLines } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallPromptModal } from '../components/InstallPromptModal';
import { useVoiceChat } from '../hooks/useVoiceChat';

export function VoicePage() {
  useAuth();
  const transcriptRef = useRef<HTMLParagraphElement>(null);
  const { isInstallable, install, showInstructions, setShowInstructions, platform } = usePWAInstall();
  const {
    status,
    transcript,
    transcriptSpeaker,
    startConversation,
    stopConversation,
    error,
  } = useVoiceChat();

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Derived states
  const isConnecting = status === 'connecting' || status === 'disconnected';
  const isReady = status === 'ready';
  const isInConversation = status === 'listening' || status === 'processing' || status === 'speaking';
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isProcessing = status === 'processing';
  const hasBlockingError = status === 'error';
  const canUseMic = !isInConversation && !isConnecting;

  const handleMicClick = () => {
    if (isInConversation) {
      stopConversation();
    } else if (canUseMic) {
      void startConversation();
    }
  };

  // Status text shown beneath the mic button
  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (error && !isInConversation) return error;
    if (hasBlockingError) return error || 'Connection error';
    if (isReady) return 'Tap to speak';
    if (isListening) return 'Listening...';
    if (isProcessing) return 'Thinking...';
    if (isSpeaking) return 'Speaking...';
    return '';
  };

  // Mic button colour classes
  const getMicButtonClasses = () => {
    if (isInConversation) {
      if (isSpeaking) return 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30';
      if (isProcessing) return 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30';
      return 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'; // listening
    }
    if (isConnecting) return 'bg-gray-300 shadow-gray-300/20';
    if (hasBlockingError || (error && !isInConversation)) {
      return 'bg-red-400 shadow-red-400/20';
    }
    return 'bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] shadow-[#6F42C1]/30'; // ready
  };

  // Icon inside mic button
  const getMicIcon = () => {
    if (isConnecting) return <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white animate-spin" />;
    if (isInConversation) {
      if (isSpeaking) {
        return (
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
            <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />
          </motion.div>
        );
      }
      if (isProcessing) {
        return <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white animate-spin" />;
      }
      // Listening – show stop icon
      return <Square className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="white" />;
    }
    if (hasBlockingError) {
      return <WifiOff className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />;
    }
    return <Mic className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />;
  };

  // Ring animation colours
  const getRingColour = () => {
    if (isListening) return 'bg-red-500';
    if (isSpeaking) return 'bg-emerald-500';
    if (isProcessing) return 'bg-amber-500';
    return 'bg-[#6F42C1]';
  };

  // Transcript label
  const getTranscriptLabel = () => {
    if (transcriptSpeaker === 'user') return 'You';
    if (transcriptSpeaker === 'assistant') return 'CairCompanion';
    return 'Live Transcript';
  };

  const connectionBadge = (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isInConversation
        ? 'bg-green-100 text-green-700'
        : isReady
          ? 'bg-green-100 text-green-700'
          : isConnecting
            ? 'bg-yellow-100 text-yellow-700'
            : hasBlockingError
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600'
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${isInConversation || isReady ? 'bg-green-500' :
          isConnecting ? 'bg-yellow-500 animate-pulse' :
            hasBlockingError ? 'bg-red-500' : 'bg-gray-400'
          }`}
      />
      {isInConversation ? 'In Conversation' :
        isReady ? 'Ready' :
          isConnecting ? 'Connecting...' :
            hasBlockingError ? 'Error' : 'Offline'}
    </div>
  );

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      {/* Header - hidden on mobile, shown on desktop */}
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-5 md:px-6 md:py-6 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Voice Assistant</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-0.5">Talk to your health companion</p>
            </div>
          </div>
          {connectionBadge}
        </div>
      </header>

      {/* Main content — grows with content so AppLayout main can scroll on small viewports */}
      <main className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 md:py-8 flex flex-col gap-5 sm:gap-8 pb-2">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 px-2">
            Talk to CairCompanion
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-2">
            Your AI health assistant is ready to help
          </p>
          <div className="md:hidden flex justify-center pt-1">{connectionBadge}</div>
        </div>

        {/* Mic button */}
        <div className="flex flex-col items-center py-2 sm:py-4">
          {/* Animated Rings - always rendered, opacity controlled to prevent remount flicker */}
          <div className="relative">
            <motion.div
              animate={{
                scale: isInConversation ? [1, 1.5, 1] : 1,
                opacity: isInConversation ? [0.5, 0, 0.5] : 0
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className={`absolute inset-0 rounded-full ${getRingColour()} pointer-events-none`}
            />
            <motion.div
              animate={{
                scale: isInConversation ? [1, 1.8, 1] : 1,
                opacity: isInConversation ? [0.4, 0, 0.4] : 0
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, ease: 'easeOut' }}
              className={`absolute inset-0 rounded-full ${getRingColour()} pointer-events-none`}
            />
            <motion.div
              animate={{
                scale: isInConversation ? [1, 2.1, 1] : 1,
                opacity: isInConversation ? [0.3, 0, 0.3] : 0
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6, ease: 'easeOut' }}
              className={`absolute inset-0 rounded-full ${getRingColour()} pointer-events-none`}
            />

            {/* Main Mic Button */}
            <motion.button
              id="voice-mic-button"
              onClick={handleMicClick}
              disabled={isConnecting}
              aria-label={error && isReady ? 'Retry microphone' : isInConversation ? 'Stop conversation' : 'Start conversation'}
              whileHover={canUseMic ? { scale: 1.05 } : undefined}
              whileTap={canUseMic ? { scale: 0.95 } : undefined}
              className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${getMicButtonClasses()} ${isConnecting && 'opacity-80'}`}
            >
              {getMicIcon()}
            </motion.button>
          </div>

          {/* Status Text - no key prop to prevent remount flicker */}
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className={`mt-4 sm:mt-6 text-base sm:text-lg font-medium text-center px-4 transition-colors duration-300 ${error && !isInConversation ? 'text-red-500' : 'text-gray-600'}`}
          >
            {getStatusText()}
          </motion.p>

          {error && isReady && (
            <p className="mt-2 text-sm text-gray-500 text-center px-4">Tap the microphone to try again.</p>
          )}

          {/* In-conversation hint */}
          {isInConversation && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-gray-400"
            >
              {isSpeaking ? 'Speak to interrupt' : isListening ? 'Tap stop to end' : ''}
            </motion.p>
          )}
        </div>

        {/* Live Transcript */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 sm:p-5 md:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              {isInConversation ? (
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${transcriptSpeaker === 'user' ? 'bg-red-500' :
                    transcriptSpeaker === 'assistant' ? 'bg-emerald-500' :
                      'bg-[#6F42C1]'
                  }`} />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-[#6F42C1]" />
              )}
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {getTranscriptLabel()}
                {isInConversation && transcriptSpeaker && (
                  <AudioLines className={`w-4 h-4 ${transcriptSpeaker === 'user' ? 'text-red-400' : 'text-emerald-400'
                    }`} />
                )}
              </h3>
            </div>
            <p
              ref={transcriptRef}
              className="text-sm sm:text-base text-gray-600 leading-relaxed min-h-[4.5rem] max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto overscroll-y-contain pr-2 custom-scrollbar break-words"
            >
              {transcript || (isConnecting
                ? 'Connecting to voice assistant...'
                : isReady
                  ? 'Click the microphone to start speaking'
                  : hasBlockingError
                    ? error
                    : ''
              )}
            </p>
          </motion.div>

          {/* Install PWA Button */}
          {isInstallable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full mt-3"
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={install}
              >
                <Download className="w-5 h-5 mr-2" />
                Install CairCompanion App
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <InstallPromptModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        platform={platform}
      />
    </div>
  );
}
