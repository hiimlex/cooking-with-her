export const UNITS = [
  'unid', 'g', 'ml', 'kg', 'L',
  'xícara', 'col. sopa', 'col. chá',
  'dente', 'fatia', 'ramo',
] as const;

export type Unit = (typeof UNITS)[number];

const DISCRETE_UNIT_SET = new Set([
  'unid', 'xícara', 'col. sopa', 'col. chá',
  'dente', 'fatia', 'ramo',
]);

export function isDiscreteUnit(unit: string): boolean {
  return DISCRETE_UNIT_SET.has(unit.trim());
}

export function stepForUnit(unit: string): number {
  return isDiscreteUnit(unit) ? 1 : 0.1;
}

export function defaultQtyForUnit(unit: string): number {
  if (isDiscreteUnit(unit)) return 1;
  const u = unit.toLowerCase();
  if (u === 'kg' || u === 'l') return 0.5;
  if (u === 'g')               return 100;
  if (u === 'ml')              return 200;
  return 1;
}

export function formatQtyForUnit(qty: number, unit: string): string {
  if (isDiscreteUnit(unit)) return String(Math.round(qty));
  const rounded = Math.round(qty * 10) / 10;
  const u = unit.toLowerCase();
  if (u === 'l' || u === 'kg') return rounded.toFixed(1);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
