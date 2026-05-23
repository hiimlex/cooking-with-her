// src/components/organisms/CookingHeatmap.tsx — GH-style activity grid
function heatColor(v: number): string {
  if (v < 0.15) return '#f3eefe';
  if (v < 0.35) return '#d6c5fc';
  if (v < 0.6)  return '#a78bfa';
  if (v < 0.85) return '#7c3aed';
  return '#5b21b6';
}

export interface CookingHeatmapProps {
  weeks?: number;
  days?: number;
}

export function CookingHeatmap({ weeks = 12, days = 7 }: CookingHeatmapProps) {
  const intensity = (w: number, d: number) => {
    const k = (w * 7 + d) * 31;
    return (Math.sin(k * 0.7) + 1) / 2;
  };
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar">
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} className="flex flex-col gap-1 flex-1 min-w-[14px]">
          {Array.from({ length: days }).map((_, d) => {
            const i = intensity(w, d);
            // emphasize the last two weeks for the streak narrative
            const recentStreak = w >= weeks - 2 && d > 0;
            const v = recentStreak ? 0.75 : i;
            return (
              <div
                key={d}
                className="aspect-square rounded-[3px] min-h-[12px]"
                style={{ background: heatColor(v) }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export const HeatLegend = () => (
  <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-muted">
    <span>Less</span>
    {[0.1, 0.35, 0.6, 0.85].map((v) => (
      <div key={v} className="w-[11px] h-[11px] rounded-[3px]" style={{ background: heatColor(v) }} />
    ))}
    <span>More</span>
  </div>
);
