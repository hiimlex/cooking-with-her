import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface Props {
  children: React.ReactNode;
}

export function TabScrollContainer({ children }: Props) {
  const qc  = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);

  const onRefresh = () =>
    qc.invalidateQueries();

  const { pulling, refreshing, pullDistance } = usePullToRefresh(
    ref as React.RefObject<HTMLElement>,
    onRefresh,
  );

  const showIndicator = pulling || refreshing;

  return (
    <div ref={ref} className="h-full overflow-y-auto overflow-x-hidden no-scrollbar pb-[120px]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all"
        style={{
          height:          showIndicator ? `${Math.max(pullDistance, refreshing ? 48 : 0)}px` : 0,
          transitionDuration: pulling ? '0ms' : '300ms',
        }}
      >
        <div
          className={[
            'w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent',
            refreshing ? 'animate-spin' : '',
          ].join(' ')}
          style={{
            transform:   refreshing ? undefined : `rotate(${(pullDistance / 72) * 240}deg)`,
            opacity:     showIndicator ? 1 : 0,
            transition:  pulling ? 'none' : 'opacity 200ms',
          }}
        />
      </div>

      {children}
    </div>
  );
}
