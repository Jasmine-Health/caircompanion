import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div>
      <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">{title}</h2>
      <Card>
        <CardContent className="p-0 divide-y divide-gray-100">{children}</CardContent>
      </Card>
    </div>
  );
}
