// src/components/molecules/Macro.tsx — single macro tile
export interface MacroProps {
  label: string;
  grams: number;
  color: string;
}

export function Macro({ label, grams, color }: MacroProps) {
  return (
    <div className="rounded-2xl px-3 py-2.5" style={{ background: color + '14' }}>
      <div className="text-[18px] font-extrabold tracking-[-0.3px] leading-none" style={{ color }}>
        {grams}<span className="text-[11px] ml-0.5">g</span>
      </div>
      <div className="text-[11px] text-muted mt-1 font-semibold">{label}</div>
    </div>
  );
}
