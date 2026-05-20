import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type PWAPlatform = 'ios' | 'android' | 'desktop' | 'other';

const getInitialPlatform = (): PWAPlatform => {
  if (typeof window === 'undefined') return 'other';
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
                (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);

  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  if (/windows|macintosh|linux/.test(userAgent)) return 'desktop';
  return 'other';
};

const getInitialInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(getInitialInstalled);
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform] = useState<PWAPlatform>(getInitialPlatform);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleDeferredPromptCaptured = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }
    };

    // Check synchronously if the prompt was already captured prior to React mounting
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('deferredpromptcaptured', handleDeferredPromptCaptured);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('deferredpromptcaptured', handleDeferredPromptCaptured);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    // If the browser has a captured prompt, ensure we reference it
    const activePrompt = deferredPrompt || (window as any).deferredPrompt;

    if (!activePrompt) {
      // Fallback to custom instructions modal if browser doesn't support native prompt
      setShowInstructions(true);
      return false;
    }

    try {
      await activePrompt.prompt();
      const { outcome } = await activePrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      return outcome === 'accepted';
    } catch (err) {
      console.error('PWA install prompt failed, showing fallback instructions:', err);
      setShowInstructions(true);
      return false;
    }
  };

  // The PWA is installable if it is not already running standalone (installed)
  const isInstallable = !isInstalled;

  return { 
    isInstallable, 
    isInstalled, 
    install, 
    showInstructions, 
    setShowInstructions, 
    platform 
  };
}


