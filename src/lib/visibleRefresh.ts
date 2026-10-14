export function watchVisible(load: () => void, intervalMs = 20000): () => void {
  const tick = () => {
    if (document.visibilityState === 'visible') load();
  };
  const id = window.setInterval(tick, intervalMs);
  window.addEventListener('focus', tick);
  document.addEventListener('visibilitychange', tick);
  return () => {
    window.clearInterval(id);
    window.removeEventListener('focus', tick);
    document.removeEventListener('visibilitychange', tick);
  };
}
