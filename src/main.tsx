import { StrictMode, useState, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { SplashScreen } from './components/SplashScreen';

function AppShell() {
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

declare global {
  interface Window {
    __caircompanionRoot?: Root;
  }
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

const root = window.__caircompanionRoot ?? createRoot(container);
window.__caircompanionRoot = root;

root.render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
