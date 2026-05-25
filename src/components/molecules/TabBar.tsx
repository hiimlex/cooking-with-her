import { useLocation, useNavigate } from 'react-router-dom';
import {
  IcTabCook, IcTabPantry, IcTabShop, IcTabStats, IcTabUs,
} from '@/icons';

export type TabId = 'home' | 'pantry' | 'shop' | 'stats' | 'us';

const TABS = [
  { id: 'home',   label: 'Cozinhar', Icon: IcTabCook,   route: '/home' },
  { id: 'pantry', label: 'Despensa', Icon: IcTabPantry, route: '/pantry' },
  { id: 'shop',   label: 'Compras',  Icon: IcTabShop,   route: '/shopping' },
  { id: 'stats',  label: 'Stats',    Icon: IcTabStats,  route: '/stats' },
  { id: 'us',     label: 'Nós',      Icon: IcTabUs,     route: '/us' },
] as const;

export function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = (TABS.find((t) => pathname.startsWith(t.route))?.id ?? 'home') as TabId;

  return (
    <div className="glass absolute left-0 right-0 bottom-0 pt-2.5 pb-[30px] flex justify-around items-center z-30">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => navigate(t.route)}
            className={[
              'flex flex-col items-center gap-1 px-[14px] py-1 relative',
              isActive ? 'text-accent' : 'text-subtle',
            ].join(' ')}
          >
            <t.Icon filled={isActive} />
            <span className={[
              'text-[10.5px]',
              isActive ? 'font-bold' : 'font-medium',
            ].join(' ')}>{t.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
