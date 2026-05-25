import { useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface AccentPreset {
  label:  string;
  value:  string;
  em:     string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { label: 'Roxo',    value: '#7c3aed', em: '#6d28d9' },
  { label: 'Rosa',    value: '#db2777', em: '#be185d' },
  { label: 'Azul',    value: '#2563eb', em: '#1d4ed8' },
  { label: 'Verde',   value: '#16a34a', em: '#15803d' },
  { label: 'Laranja', value: '#ea580c', em: '#c2410c' },
  { label: 'Teal',    value: '#0d9488', em: '#0f766e' },
];

function applyToDOM(theme: ThemeMode, accent: string, em: string) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.dataset.theme = 'dark';
  } else {
    delete root.dataset.theme;
  }
  root.style.setProperty('--c-accent', accent);
  root.style.setProperty('--c-accent-em', em);
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem('cwh_theme') as ThemeMode | null) ?? 'light',
  );
  const [accent, setAccent] = useState(
    () => localStorage.getItem('cwh_accent') ?? '#7c3aed',
  );

  const changeTheme = (next: ThemeMode) => {
    const em = ACCENT_PRESETS.find((p) => p.value === accent)?.em ?? accent;
    localStorage.setItem('cwh_theme', next);
    setTheme(next);
    applyToDOM(next, accent, em);
  };

  const changeAccent = (next: AccentPreset) => {
    localStorage.setItem('cwh_accent', next.value);
    setAccent(next.value);
    applyToDOM(theme, next.value, next.em);
  };

  return { theme, accent, changeTheme, changeAccent };
}
