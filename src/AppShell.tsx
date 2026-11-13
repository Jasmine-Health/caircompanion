import { useEffect, useState } from 'react';
import App from './App.tsx';
import { SplashScreen } from './components/SplashScreen';

/** The app with the launch splash screen over it for its first 1.9 seconds. */
export function AppShell() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeSplash(true), 1500);
    const removeTimer = setTimeout(() => setShowSplash(false), 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      <App />
      {showSplash && <SplashScreen fading={fadeSplash} />}
    </>
  );
}
