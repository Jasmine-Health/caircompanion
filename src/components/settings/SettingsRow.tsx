import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface SettingsRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  iconClassName?: string;
  showChevron?: boolean;
}

export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  iconClassName = 'bg-gray-100 text-gray-700',
  showChevron = true,
}: SettingsRowProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 text-left ${onClick ? 'hover:bg-gray-50 transition-colors' : ''}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconClassName}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{title}</p>
        {subtitle ? <p className="text-sm text-gray-500 truncate">{subtitle}</p> : null}
      </div>
      {showChevron && onClick ? <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" /> : null}
    </Tag>
  );
}
