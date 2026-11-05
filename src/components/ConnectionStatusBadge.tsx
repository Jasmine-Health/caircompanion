interface ConnectionStatusBadgeProps {
  isOnline: boolean;
  className?: string;
}

export function ConnectionStatusBadge({ isOnline, className = '' }: ConnectionStatusBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'Online' : 'Offline'}
    >
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
