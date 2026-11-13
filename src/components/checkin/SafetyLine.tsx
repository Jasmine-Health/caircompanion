import { Phone } from 'lucide-react';

/** The program's 911 line, word for word. Shown wherever a check-in is. */
export function SafetyLine({ text }: { text: string }) {
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base font-medium text-red-900"
    >
      <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
