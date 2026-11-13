import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import './index.css';
import { AppShell } from './AppShell';

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
