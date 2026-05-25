import { useCallback, useEffect, useRef, useState } from 'react';

const THRESHOLD = 72;   // px to pull before triggering
const RESIST    = 0.4;  // drag resistance factor

export interface PullToRefreshState {
  pulling:      boolean;
  refreshing:   boolean;
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
  const isDragging = useRef(false);

  const trigger = useCallback(async () => {
    isDragging.current = false;
    setRefreshing(true);
    setPulling(false);
    setPullDistance(0);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const onDragStart = useCallback((clientY: number) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current     = clientY;
    isDragging.current = true;
  }, [containerRef]);

  const onDragMove = useCallback((clientY: number, preventDefault?: () => void) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) {
      isDragging.current = false;
      setPulling(false);
      setPullDistance(0);
      return;
    }
    const delta = (clientY - startY.current) * RESIST;
    if (delta <= 0) {
      setPulling(false);
      setPullDistance(0);
      return;
    }
    preventDefault?.();
    setPulling(true);
    setPullDistance(Math.min(delta, THRESHOLD * 1.5));
  }, [containerRef]);

  const onDragEnd = useCallback((clientY: number) => {
    if (!isDragging.current) return;
    const delta = (clientY - startY.current) * RESIST;
    if (delta >= THRESHOLD) {
      trigger();
    } else {
      isDragging.current = false;
      setPulling(false);
      setPullDistance(0);
    }
  }, [trigger]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // ── Touch (mobile) ────────────────────────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => onDragStart(e.touches[0].clientY);
    const onTouchMove  = (e: TouchEvent) => onDragMove(e.touches[0].clientY, () => e.preventDefault());
    const onTouchEnd   = (e: TouchEvent) => onDragEnd(e.changedTouches[0].clientY);

    // ── Mouse (desktop / web) ─────────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => onDragStart(e.clientY);
    const onMouseMove = (e: MouseEvent) => { if (isDragging.current) onDragMove(e.clientY); };
    const onMouseUp   = (e: MouseEvent) => onDragEnd(e.clientY);

    el.addEventListener('touchstart', onTouchStart, { passive: true  });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true  });

    el.addEventListener('mousedown', onMouseDown);
    // mousemove / mouseup on window so dragging outside the container still works
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
      el.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [containerRef, onDragStart, onDragMove, onDragEnd]);

  return { pulling, refreshing, pullDistance };
}
