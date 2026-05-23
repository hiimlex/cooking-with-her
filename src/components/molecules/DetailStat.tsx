// src/components/molecules/DetailStat.tsx
export interface DetailStatProps {
  label: string;
  value: string | number;
}

export function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="bg-canvas rounded-2xl px-3 py-2.5 text-center">
      <div className="text-base font-extrabold text-ink tracking-[-0.3px]">{value}</div>
      <div className="text-[11px] text-muted mt-0.5 font-semibold">{label}</div>
    </div>
  );
}
