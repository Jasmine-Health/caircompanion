import type { ReactNode } from 'react';

const MOTION_PROP_KEYS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'layoutId',
  'layout',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
]);

function stripMotionProps(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => !MOTION_PROP_KEYS.has(key) && !key.startsWith('while')
    )
  );
}

function Motion({
  children,
  onClick,
  ...props
}: {
  children?: ReactNode;
  onClick?: () => void;
}) {
  const domProps = stripMotionProps(props);
  return (
    <div
      {...domProps}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export const motion = new Proxy(
  {},
  {
    get: () => Motion,
  }
);

export function AnimatePresence({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
