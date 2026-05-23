// src/icons/index.tsx — Octicon-style line icons + food glyphs
import type { FoodGlyphId } from '@/types';

export interface IconProps {
  size?: number;
  className?: string;
}

interface IcProps extends IconProps {
  d?: string;
  fill?: string;
  stroke?: string;
  sw?: number;
  vb?: string;
  children?: React.ReactNode;
}

const Ic = ({
  d, size = 16, fill = 'none', stroke = 'currentColor', sw = 1.6, vb, children, className,
}: IcProps) => (
  <svg
    width={size} height={size}
    viewBox={vb || `0 0 ${size === 24 ? 24 : 16} ${size === 24 ? 24 : 16}`}
    fill={fill === 'currentColor' ? 'currentColor' : 'none'}
    stroke={fill === 'currentColor' ? 'none' : stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={className}
    style={{ display: 'block', flexShrink: 0 }}
  >
    {d && <path d={d} />}
    {children}
  </svg>
);

// ── Generic icons ─────────────────────────────────────────────────────────────
export const IcHome     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} d="M2 6l6-4 6 4v8H10v-4H6v4H2V6z" />;
export const IcPlus     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} d="M8 3v10M3 8h10" />;
export const IcSearch   = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></Ic>;
export const IcCheck    = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} d="M3 8.5l3 3 7-7" />;
export const IcX        = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} d="M3 3l10 10M13 3L3 13" />;
export const IcChevRight= ({ size = 16, className }: IconProps) => <Ic size={size} className={className} d="M6 3l5 5-5 5" />;
export const IcChevLeft = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} d="M10 3L5 8l5 5" />;
export const IcChevDown = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} d="M3 6l5 5 5-5" />;
export const IcClock    = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 2"/></Ic>;
export const IcCalendar = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><rect x="2" y="3.5" width="12" height="11" rx="1"/><path d="M2 6.5h12M5.5 2v3M10.5 2v3"/></Ic>;
export const IcMore     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} fill="currentColor" sw={0}><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></Ic>;
export const IcPlay     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} fill="currentColor" sw={0} d="M4 2.5v11l9-5.5-9-5.5z" />;
export const IcPause    = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} fill="currentColor" sw={0}><rect x="3" y="3" width="3.5" height="10"/><rect x="9.5" y="3" width="3.5" height="10"/></Ic>;
export const IcAlert    = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><path d="M8 1.5L14.5 13H1.5L8 1.5z"/><path d="M8 6v3M8 11h0"/></Ic>;
export const IcInfo     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><circle cx="8" cy="8" r="6.5"/><path d="M8 7v4M8 5h0"/></Ic>;
export const IcLock     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><rect x="3" y="7" width="10" height="7" rx="1"/><path d="M5 7V4.5a3 3 0 016 0V7"/></Ic>;
export const IcBook     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><path d="M2 3h5c1 0 2 .5 2 2v9c0-1-1-1.5-2-1.5H2V3z"/><path d="M14 3H9c-1 0-2 .5-2 2v9c0-1 1-1.5 2-1.5h5V3z"/></Ic>;
export const IcImage    = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><rect x="1.5" y="2.5" width="13" height="11" rx="1"/><circle cx="5.5" cy="6" r="1"/><path d="M1.5 11l3-3 4 4 2-2 4 4"/></Ic>;
export const IcGear     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v2M8 12.5v2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M1.5 8h2M12.5 8h2M3.5 12.5L5 11M11 5l1.5-1.5"/></Ic>;
export const IcTarget   = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/></Ic>;
export const IcRepo     = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><path d="M2 2.5A1.5 1.5 0 013.5 1H14v12H3.5a1.5 1.5 0 00-1.5 1.5V2.5z"/><path d="M2 13.5A1.5 1.5 0 013.5 12H14"/></Ic>;
export const IcUtensils = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><path d="M4 1.5v6M4 7.5v7M2 1.5v4a2 2 0 004 0v-4"/><path d="M12 1.5v6c0 .5 1 .5 1 0V1.5"/><path d="M12 7.5v7"/></Ic>;
export const IcFridge   = ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><rect x="3" y="1.5" width="10" height="13" rx="1"/><path d="M3 6h10M5 3.5v1.5M5 8v3"/></Ic>;
export const IcPencil   = ({ size = 16, className }: IconProps) => <Ic size={size} className={className} d="M11.5 1.5L14 4l-9 9H2v-3l9.5-8.5z" />;
export const IcGitBranch= ({ size = 16, className }: IconProps) => <Ic size={size} className={className}><circle cx="4" cy="3" r="1.5"/><circle cx="4" cy="13" r="1.5"/><circle cx="12" cy="5" r="1.5"/><path d="M4 4.5v7M5.5 5h2c2 0 2.5 1 2.5 2.5"/></Ic>;

// Affect icons
export const IcStar = ({ size = 16, filled = false, className }: IconProps & { filled?: boolean }) => (
  <Ic size={size} className={className} fill={filled ? 'currentColor' : 'none'}>
    <path d="M8 1.5l1.9 4.1 4.5.5-3.4 3 1 4.4L8 11.3 3.9 13.5l1-4.4L1.5 6.1l4.5-.5L8 1.5z" />
  </Ic>
);
export const IcHeart = ({ size = 16, filled = false, className }: IconProps & { filled?: boolean }) => (
  <Ic size={size} className={className} fill={filled ? 'currentColor' : 'none'}>
    <path d="M8 13.5C4 11 1 8.5 1 5.5 1 3.5 2.5 2 4.5 2c1.5 0 2.5.8 3.5 2.2C9 2.8 10 2 11.5 2 13.5 2 15 3.5 15 5.5c0 3-3 5.5-7 8z" />
  </Ic>
);
export const IcFlame = ({ size = 16, className }: IconProps) => (
  <Ic size={size} className={className}>
    <path d="M8 14.5c-2.8 0-4.5-2-4.5-4.5 0-2 1-3 1.5-4 0 1.5.5 2 1.5 2.5C6 6 6.5 4 9 1.5c0 2.5 1.5 3.5 2.5 5.5.5 1 1 2 1 3 0 2.5-1.7 4.5-4.5 4.5z" />
  </Ic>
);
export const IcSparkle = ({ size = 16, className }: IconProps) => (
  <Ic size={size} className={className}>
    <path d="M6 1l1.3 3.7L11 6 7.3 7.3 6 11 4.7 7.3 1 6l3.7-1.3L6 1z" />
    <path d="M12 9l.6 1.4L14 11l-1.4.6L12 13l-.6-1.4L10 11l1.4-.6L12 9z" />
  </Ic>
);

// ── Tab bar icons (24px, thinner strokes) ─────────────────────────────────────
const TAB = { size: 24, sw: 1.5 };

export const IcTabCook = ({ filled }: { filled?: boolean }) => (
  <svg width={TAB.size} height={TAB.size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={TAB.sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block' }}>
    {filled && <path d="M4 9.5C4 6.5 6.5 4 9.5 4h5C17.5 4 20 6.5 20 9.5V11H4V9.5Z" fill="currentColor" stroke="none"/>}
    {!filled && <path d="M4 9.5C4 6.5 6.5 4 9.5 4h5C17.5 4 20 6.5 20 9.5V11"/>}
    <path d="M3.5 11h17" />
    <path d="M5 14.5L5.5 19a1 1 0 0 0 1 .8h11a1 1 0 0 0 1-.8L19 14.5" />
  </svg>
);
export const IcTabPantry = ({ filled }: { filled?: boolean }) => (
  <svg width={TAB.size} height={TAB.size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={TAB.sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block' }}>
    {filled && <rect x="5" y="3.5" width="14" height="17" rx="2" fill="currentColor" opacity="0.18" stroke="none"/>}
    <rect x="5" y="3.5" width="14" height="17" rx="2"/>
    <path d="M5 9h14M5 14.5h14"/>
  </svg>
);
export const IcTabShop = ({ filled }: { filled?: boolean }) => (
  <svg width={TAB.size} height={TAB.size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={TAB.sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block' }}>
    {filled && <path d="M5.5 7h13.5l-1.6 8.4a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6L5.5 7Z" fill="currentColor" opacity="0.18" stroke="none"/>}
    <path d="M3 4h2l.5 3M5.5 7h13.5l-1.6 8.4a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6L5.5 7Z"/>
    <circle cx="9" cy="20" r="1.2"/>
    <circle cx="16" cy="20" r="1.2"/>
  </svg>
);
export const IcTabStats = ({ filled }: { filled?: boolean }) => (
  <svg width={TAB.size} height={TAB.size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={TAB.sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block' }}>
    {filled ? (
      <>
        <rect x="4" y="13" width="3" height="7" rx="1" fill="currentColor" stroke="none"/>
        <rect x="10.5" y="9" width="3" height="11" rx="1" fill="currentColor" stroke="none"/>
        <rect x="17" y="5" width="3" height="15" rx="1" fill="currentColor" stroke="none"/>
      </>
    ) : (
      <>
        <rect x="4" y="13" width="3" height="7" rx="1"/>
        <rect x="10.5" y="9" width="3" height="11" rx="1"/>
        <rect x="17" y="5" width="3" height="15" rx="1"/>
      </>
    )}
  </svg>
);
export const IcTabUs = ({ filled }: { filled?: boolean }) => (
  <svg width={TAB.size} height={TAB.size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={TAB.sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block' }}>
    {filled && (
      <>
        <circle cx="8.5" cy="9" r="3.2" fill="currentColor" opacity="0.22" stroke="none"/>
        <circle cx="15.5" cy="9" r="3.2" fill="currentColor" opacity="0.22" stroke="none"/>
      </>
    )}
    <circle cx="8.5" cy="9" r="3.2"/>
    <circle cx="15.5" cy="9" r="3.2"/>
    <path d="M3 19c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5"/>
    <path d="M10 19c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5"/>
  </svg>
);

// ── Food glyphs ──────────────────────────────────────────────────────────────
export interface FoodGlyphDef { color: string; d: string; }

export const FOOD_GLYPHS: Record<FoodGlyphId, FoodGlyphDef> = {
  Tomato:  { color: '#cf222e', d: 'M8 14c-3 0-5-2-5-5 0-3 2-5 5-5s5 2 5 5-2 5-5 5z M8 4c-1-1 0-2 1-2.5' },
  Carrot:  { color: '#bc4c00', d: 'M5.5 14L13 6.5l-2-2L3.5 12 5.5 14z M10 4l1.5-1.5M11 5.5L12.5 4' },
  Egg:     { color: '#bf8700', d: 'M8 14c-2.5 0-4.5-2-4.5-4.5 0-3 2-7.5 4.5-7.5s4.5 4.5 4.5 7.5C12.5 12 10.5 14 8 14z' },
  Pepper:  { color: '#1a7f37', d: 'M5 14C3 12 3 9 5 7c2-2 5-2 7 0M7 4c0-1 1-2 2-2s1.5 1 1.5 2' },
  Garlic:  { color: '#8250df', d: 'M8 14c-2 0-3.5-1.5-3.5-3.5C4.5 7.5 6 4 8 2c2 2 3.5 5.5 3.5 8.5C11.5 12.5 10 14 8 14z M8 2v4' },
  Bread:   { color: '#9a6700', d: 'M3 6c0-2 2-3 5-3s5 1 5 3v6c0 1-1 2-2 2H5c-1 0-2-1-2-2V6z' },
  Chicken: { color: '#bc4c00', d: 'M3 13c1-3 3-5 5-5s5 2 5 5M8 8c-2-1-3-3-2-5s3-2 4-1c1-1 3 0 3 2s-2 4-5 4z' },
  Fish:    { color: '#0969da', d: 'M2 8c2-3 5-4 7-4s4 2 4 4-2 4-4 4-5-1-7-4z M13 8l2-2v4l-2-2z M10 7v0' },
  Rice:    { color: '#6e7781', d: 'M3 11c1-2 3-3 5-3s4 1 5 3M3 11h10M5 8l.5-1M8 7v-1M11 8l-.5-1' },
  Cheese:  { color: '#9a6700', d: 'M2 7L14 4v8c0 1-1 2-2 2H4c-1 0-2-1-2-2V7z M5 9v0M8 11v0M11 8v0' },
  Milk:    { color: '#0969da', d: 'M5 4V2.5h6V4l1 2v7c0 .5-.5 1-1 1H5c-.5 0-1-.5-1-1V6l1-2z M4 7h8' },
  Herb:    { color: '#1a7f37', d: 'M8 14V6 M8 8C5 8 4 5 5 3 7 4 8 6 8 8 M8 8c3 0 4-3 3-5C9 4 8 6 8 8' },
  Onion:   { color: '#8250df', d: 'M8 14c-2.5 0-4-2-4-4.5 0-3 1.5-6.5 4-7.5 2.5 1 4 4.5 4 7.5 0 2.5-1.5 4.5-4 4.5z M6 4v-2M10 4v-2' },
  Lemon:   { color: '#bf8700', d: 'M8 13c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5z M5 4l-1-1M12 4l1-1' },
  Pasta:   { color: '#bf8700', d: 'M3 4v8M5 4v8M7 4v8M9 4v8M11 4v8M13 4v8 M2 4h12' },
};
