import type { LucideIcon } from 'lucide-react';

interface SettingsToggleRowProps {
  icon: LucideIcon;
  title: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  iconClassName?: string;
}

export function SettingsToggleRow({
  icon: Icon,
  title,
  enabled,
  onChange,
  iconClassName = 'bg-gray-100 text-gray-700',
}: SettingsToggleRowProps) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconClassName}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="flex-1 font-medium text-gray-900">{title}</p>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-[#6F42C1]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
