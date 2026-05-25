export const DIFFICULTY_PT: Record<string, string> = {
  Easy:   'Fácil',
  Medium: 'Médio',
  Hard:   'Difícil',
};

export const TAG_PT: Record<string, string> = {
  Brunch:  'Brunch',
  Lunch:   'Almoço',
  Dinner:  'Jantar',
  Snack:   'Lanche',
  Weekday: 'Semana',
  AI:      'Nonna',
};

export function diffPT(d: string): string {
  return DIFFICULTY_PT[d] ?? d;
}

export function tagPT(t: string): string {
  return TAG_PT[t] ?? t;
}
