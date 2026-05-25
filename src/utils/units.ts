export const UNITS = ["unid", "g", "kg", "ml", "L"] as const;

export type Unit = (typeof UNITS)[number];

export function isDiscreteUnit(unit: string): boolean {
  return unit.trim() === "unid";
}

export function stepForUnit(unit: string): number {
  const u = unit.trim();
  if (u === "g" || u === "ml") return 50;
  if (u === "kg" || u === "L") return 0.5;
  return 1;
}

export function defaultQtyForUnit(unit: string): number {
  const u = unit.trim();
  if (u === "unid") return 1;
  if (u === "kg" || u === "L") return 0.5;
  if (u === "g")               return 100;
  if (u === "ml")              return 200;
  return 1;
}

export function formatQtyForUnit(qty: number, unit: string): string {
  if (unit.trim() === "unid") return String(Math.round(qty));
  const rounded = Math.round(qty * 10) / 10;
  const u = unit.trim();
  if (u === "L" || u === "kg") return rounded.toFixed(1);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
