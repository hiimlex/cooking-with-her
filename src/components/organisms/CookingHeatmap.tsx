import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { IcChevRight } from '@/icons';

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function heatColor(v: number): string {
  if (v <= 0)   return '#ede9fe';
  if (v < 0.35) return '#c4b5fd';
  if (v < 0.6)  return '#a78bfa';
  if (v < 0.85) return '#7c3aed';
  return '#5b21b6';
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
}

const CELL = 13;
const GAP  = 3;
const DAY_LABEL_W = 14;

export interface HeatmapRecipe {
  id:   string;
  name: string;
}

export interface CookingHeatmapProps {
  weeks?:         number;
  data?:          Record<string, number>;
  recipes?:       Record<string, HeatmapRecipe[]>;
  onRecipePress?: (id: string) => void;
}

interface Cell {
  date:   string;
  count:  number;
  future: boolean;
}

interface Popover {
  x:       number;
  y:       number;
  date:    string;
  count:   number;
  recipes: HeatmapRecipe[];
}

export function CookingHeatmap({ weeks = 12, data, recipes, onRecipePress }: CookingHeatmapProps) {
  const [popover, setPopover] = useState<Popover | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { columns, monthMarkers, maxCount } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStr = today.toISOString().split('T')[0];

    const dow = today.getDay();
    const daysSinceMonday = (dow + 6) % 7;
    const start = new Date(today);
    start.setDate(today.getDate() - daysSinceMonday - (weeks - 1) * 7);
    start.setHours(0, 0, 0, 0);

    const cols: Cell[][] = [];
    const markers: { col: number; label: string }[] = [];
    let prevMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const cell = new Date(start);
        cell.setDate(start.getDate() + w * 7 + d);
        const key = cell.toISOString().split('T')[0];
        col.push({ date: key, count: data?.[key] ?? 0, future: key > todayStr });

        if (d === 0 && cell.getMonth() !== prevMonth) {
          markers.push({ col: w, label: MONTH_SHORT[cell.getMonth()] });
          prevMonth = cell.getMonth();
        }
      }
      cols.push(col);
    }

    const max = Math.max(1, ...cols.flat().filter((c) => !c.future).map((c) => c.count));
    return { columns: cols, monthMarkers: markers, maxCount: max };
  }, [weeks, data]);

  const handleCellClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, cell: Cell) => {
      if (cell.future || cell.count === 0) return;
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setPopover({
        x:       rect.left + rect.width / 2,
        y:       rect.top,
        date:    cell.date,
        count:   cell.count,
        recipes: recipes?.[cell.date] ?? [],
      });
    },
    [recipes],
  );

  useEffect(() => {
    if (!popover) return;
    const close = () => setPopover(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [popover]);

  return (
    <div className="select-none">
      {/* Month labels */}
      <div className="flex mb-[5px]" style={{ paddingLeft: DAY_LABEL_W + GAP }}>
        {columns.map((_, w) => {
          const m = monthMarkers.find((mk) => mk.col === w);
          return (
            <div
              key={w}
              className="text-[9px] font-semibold text-muted leading-none truncate"
              style={{ flex: 1, minWidth: CELL }}
            >
              {m?.label ?? ''}
            </div>
          );
        })}
      </div>

      {/* Day labels + grid */}
      <div className="flex" style={{ gap: GAP }}>
        {/* Day-of-week labels */}
        <div className="flex flex-col flex-shrink-0" style={{ gap: GAP, width: DAY_LABEL_W }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[9px] font-semibold text-muted text-right leading-none flex items-center justify-end"
              style={{ height: CELL }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Heat cells */}
        <div className="flex flex-1 overflow-x-auto no-scrollbar" style={{ gap: GAP }}>
          {columns.map((col, w) => (
            <div key={w} className="flex flex-col flex-1" style={{ gap: GAP, minWidth: CELL }}>
              {col.map((cell) => (
                <div
                  key={cell.date}
                  className={[
                    'rounded-[3px] flex-shrink-0',
                    !cell.future && cell.count > 0 ? 'cursor-pointer' : 'cursor-default',
                  ].join(' ')}
                  style={{
                    width:      '100%',
                    height:     CELL,
                    background: cell.future ? 'transparent' : heatColor(cell.count / maxCount),
                  }}
                  onClick={(e) => handleCellClick(e, cell)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Popover — fixed, floats above the clicked cell */}
      {popover && (
        <div
          ref={popoverRef}
          className="z-50 rounded-2xl shadow-xl"
          style={{
            position:            'fixed',
            left:                popover.x,
            top:                 popover.y - 10,
            transform:           'translate(-50%, -100%)',
            background:          'rgba(15, 10, 30, 0.92)',
            backdropFilter:      'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            padding:             '10px 12px',
            minWidth:            200,
            maxWidth:            260,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] font-semibold text-white/50 mb-2 whitespace-nowrap">
            {formatDate(popover.date)}
          </div>

          {popover.recipes.length > 0 ? (
            <div className="flex flex-col gap-1">
              {popover.recipes.map((r) => (
                <button
                  key={r.id}
                  className="flex items-center gap-2 w-full text-left rounded-xl px-2 py-1.5 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  onClick={() => {
                    setPopover(null);
                    onRecipePress?.(r.id);
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')
                  }
                >
                  <span className="flex-1 text-[12px] font-semibold text-white leading-snug">
                    {r.name}
                  </span>
                  <IcChevRight size={12} className="text-white/40 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[12px] font-semibold text-white">
              {popover.count} cook{popover.count > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const HeatLegend = () => (
  <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-muted">
    <span>Less</span>
    {[0, 0.35, 0.6, 0.85, 1].map((v) => (
      <div
        key={v}
        className="rounded-[3px]"
        style={{ width: 11, height: 11, background: heatColor(v) }}
      />
    ))}
    <span>More</span>
  </div>
);
