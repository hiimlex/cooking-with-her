import { useCallback, useEffect, useRef, useState } from 'react';

const THRESHOLD   = 72;   // px to pull before triggering
const RESIST      = 0.4;  // drag resistance factor
const SNAP_BACK   = 300;  // ms for snap-back animation

export interface PullToRefreshState {
  pulling:     boolean;
  refreshing:  boolean;
  pullDistance: number;
}

export function usePullToRefresh(
  containerRef: React.RefObject<HTMLElement>,
  onRefresh:    () => Promise<void> | void,
): PullToRefreshState {
  const [pulling,      setPulling]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const startY     = useRef(0);
  const currentY   = useRef(0);
  const isDragging = useRef(false);

  const trigger = useCallback(async () => {
    setRefreshing(true);
    setPulling(false);
    setPullDistance(0);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop > 0) return;
      startY.current   = e.touches[0].clientY;
      isDragging.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      currentY.current = e.touches[0].clientY;
      const delta = (currentY.current - startY.current) * RESIST;
      if (delta <= 0) {
        setPulling(false);
        setPullDistance(0);
        return;
      }
      e.preventDefault();
      setPulling(true);
      setPullDistance(Math.min(delta, THRESHOLD * 1.4));
    };

    const onTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const delta = (currentY.current - startY.current) * RESIST;
      if (delta >= THRESHOLD) {
        trigger();
      } else {
        setTimeout(() => {
          setPulling(false);
          setPullDistance(0);
        }, SNAP_BACK);
      }
      startY.current   = 0;
      currentY.current = 0;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [containerRef, trigger]);

  return { pulling, refreshing, pullDistance };
}
