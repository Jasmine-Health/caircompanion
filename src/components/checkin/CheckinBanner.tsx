import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { getCheckin, getOpenCheckins, type CheckinView } from '../../services/checkinService';
import { watchVisible } from '../../lib/visibleRefresh';
import { SafetyLine } from './SafetyLine';

/** Check for a new check-in every 5 minutes while the app is open, and on focus. */
const REFRESH_MS = 5 * 60 * 1000;

/**
 * The in-app reminder: shown on every page while a check-in is open, until
 * answered or put off with "Not now". The app is optional, so when the
 * check-in service cannot be reached this shows nothing.
 */
export function CheckinBanner() {
  const { pathname } = useLocation();
  const [view, setView] = useState<CheckinView | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const shownId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const next = (await getOpenCheckins())[0]?.checkin_id ?? null;
        if (next === shownId.current) return;
        const nextView = next ? await getCheckin(next) : null;
        if (cancelled) return;
        shownId.current = next;
        setView(nextView);
      } catch {
        // No check-in service or no connection: show nothing; SMS and voice still reach the patient.
      }
    };
    load();
    const stop = watchVisible(load, REFRESH_MS);
    return () => {
      cancelled = true;
      stop();
    };
  }, [pathname]);

  if (!view || view.checkin_id === dismissedId || pathname.startsWith('/checkin/') || pathname === '/chat') return null;

  return (
    <section aria-labelledby="checkin-banner-title" className="mx-4 mt-4 rounded-2xl border border-[#6F42C1]/20 bg-[#6F42C1]/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="w-6 h-6 text-[#6F42C1] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h2 id="checkin-banner-title" className="font-semibold text-gray-900">
            {view.title}
          </h2>
          <p className="mt-1 text-base text-gray-700">{view.intro}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/checkin/${encodeURIComponent(view.checkin_id)}`}
          className="flex-1 flex items-center justify-center min-h-12 rounded-xl bg-[#6F42C1] text-white font-medium hover:bg-[#5a32a3] focus:outline-none focus:ring-2 focus:ring-[#6F42C1] focus:ring-offset-2"
        >
          Answer now
        </Link>
        <button
          type="button"
          onClick={() => setDismissedId(view.checkin_id)}
          className="min-h-12 px-4 rounded-xl text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Not now
        </button>
      </div>
      <SafetyLine text={view.safety_line} />
    </section>
  );
}
