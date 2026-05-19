import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Download, Volume2 } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function VoicePage() {
  useAuth();
  const { isInstallable, install } = usePWAInstall();
  const [isRecording, setIsRecording] = useState(false);
  const [isReady] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcript, setTranscript] = useState('Click the microphone to start speaking');

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setTranscript('Click the microphone to speak again');
      // Simulate AI response
      setTimeout(() => {
        setIsPlayingAudio(true);
        setTranscript('CairCompanion: Hello! How can I help you today with your health journey?');
        setTimeout(() => setIsPlayingAudio(false), 3000);
      }, 1000);
    } else {
      setIsRecording(true);
      setTranscript('Listening... Speak now');
      // Simulate user speaking
      setTimeout(() => {
        setTranscript('You (speaking): How am I doing with my medications today...');
      }, 1500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header - hidden on mobile, shown on desktop */}
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-6 md:px-6 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Voice Assistant</h1>
              <p className="text-gray-500 mt-1">Talk to your health companion</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            isReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isReady ? 'Ready' : 'Connecting...'}
          </div>
        </div>
      </header>

      {/* Main content - flex-1 to fill available space */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4">
        {/* Title text at top */}
        <div className="text-center pt-6 md:pt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Talk to CairCompanion</h2>
          <p className="text-gray-500">Your AI health assistant is ready to help</p>
        </div>

        {/* Mic button centered in remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Animated Rings */}
          <div className="relative">
            <AnimatePresence>
              {isRecording && (
                <>
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-[#6F42C1]"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    className="absolute inset-0 rounded-full bg-[#6F42C1]"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.1, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    className="absolute inset-0 rounded-full bg-[#6F42C1]"
                  />
                </>
              )}
              {isPlayingAudio && (
                <>
                  <motion.div
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-green-500"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                    className="absolute inset-0 rounded-full bg-green-500"
                  />
                </>
              )}
            </AnimatePresence>

            {/* Main Mic Button */}
            <motion.button
              onClick={toggleRecording}
              disabled={!isReady}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative z-10 w-36 h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500 shadow-red-500/30'
                  : isPlayingAudio
                  ? 'bg-green-500 shadow-green-500/30'
                  : 'bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] shadow-[#6F42C1]/30'
              } ${!isReady && 'opacity-50 cursor-not-allowed'}`}
            >
              {isRecording ? (
                <MicOff className="w-12 h-12 md:w-16 md:h-16 text-white" />
              ) : isPlayingAudio ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Volume2 className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </motion.div>
              ) : (
                <Mic className="w-12 h-12 md:w-16 md:h-16 text-white" />
              )}
            </motion.button>
          </div>

          {/* Status Text */}
          <motion.p
            key={isRecording ? 'recording' : isPlayingAudio ? 'playing' : 'idle'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-lg font-medium text-gray-600"
          >
            {isRecording ? 'Listening...' : isPlayingAudio ? 'Speaking...' : 'Tap to speak'}
          </motion.p>
        </div>

        {/* Live Transcript - positioned at bottom */}
        <div className="flex-shrink-0 md:pb-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5 md:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6F42C1] animate-pulse" />
              <h3 className="font-semibold text-gray-900">Live Transcript</h3>
            </div>
            <p className="text-gray-600 leading-relaxed min-h-[80px] md:min-h-[100px]">
              {transcript}
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
    </div>
  );
}
