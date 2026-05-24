import { useNavigate } from 'react-router-dom';
import { Avatar, Card, FoodIcon } from '@/components/atoms';
import { MenuRow, Section } from '@/components/molecules';
import { Stars } from '@/components/atoms';
import {
  FOOD_GLYPHS, IcBook, IcGear, IcImage, IcTarget, IcUtensils,
} from '@/icons';
import { COUPLE, HISTORY, MEMORIES, RECIPES, STATS } from '@/data/mock';

export function UsPage() {
  const navigate = useNavigate();
  const stats = [
    { label: 'Cooks',   value: STATS.totalCooked },
    { label: 'Recipes', value: RECIPES.length },
    { label: 'Photos',  value: MEMORIES.length },
    { label: 'Streak',  value: STATS.streak },
  ];
  return (
    <div>
      {/* Hero */}
      <div
        className="pt-[54px] px-[18px] pb-[22px] relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f3eefe 0%, #faf8ff 100%)' }}
      >
        <div
          aria-hidden
          className="absolute top-[70px] -right-10 w-[180px] h-[180px] rounded-full pointer-events-none opacity-50"
          style={{ background: 'radial-gradient(circle, #ffd6e8 0%, transparent 70%)' }}
        />
        <div className="flex items-center gap-3.5 mb-3.5 relative">
          <div className="flex">
            <div className="-mr-3 z-[2]"><Avatar who="alex" size={56} ring /></div>
            <Avatar who="yuka" size={56} ring />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="m-0 text-[22px] font-extrabold text-ink tracking-[-0.5px]">
              Alex &amp; Yuka
            </h1>
            <div className="text-[13px] text-muted mt-0.5">
              since {COUPLE.startedDate} · 1 cat
            </div>
          </div>
        </div>

        <div className="flex bg-card rounded-3xl p-3 relative">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={[
                'flex-1 text-center',
                i < stats.length - 1 ? 'border-r border-canvas' : '',
              ].join(' ')}
            >
              <div className="text-lg font-extrabold text-ink tracking-[-0.3px] tabular-nums">
                {s.value}
              </div>
              <div className="text-[11px] text-muted font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-[18px] pt-1.5">
        <div className="flex flex-col gap-2">
          <MenuRow Icon={IcBook}     label="My Recipes" sub={`${RECIPES.length} saved · add new`}    color="#7c3aed" onClick={() => navigate('/us/recipes')} />
          <MenuRow Icon={IcImage}    label="Memories"   sub="14 cooks photographed this month"        color="#ff7eb9" onClick={() => navigate('/us/memories')} />
          <MenuRow Icon={IcUtensils} label="Utensils"   sub="10 of 12 set up"                         color="#22c55e" onClick={() => navigate('/us/utensils')} />
          <MenuRow Icon={IcTarget}   label="Goals"      sub="6 meals/week · on track"                 color="#f59e0b" />
          <MenuRow Icon={IcGear}     label="Settings"   sub="Code, theme, notifications"              color="#6b6580" />
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-[18px] pt-[22px]">
        <Section title="Recent activity" padded={false} />
        <div className="mt-3 flex flex-col gap-1.5">
          {HISTORY.slice(0, 5).map((h, i) => {
            const r = RECIPES.find((x) => x.id === h.recipeId);
            if (!r) return null;
            const accent = FOOD_GLYPHS[r.sprites[0]].color;
            return (
              <Card key={i} className="p-3 flex items-center gap-3">
                <Avatar who={h.by} size={26} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink leading-[1.4]">
                    <b>{COUPLE[h.by].name}</b> cooked <b className="text-accent">{r.name}</b>
                  </div>
                  <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5">
                    <span>
                      {h.daysAgo === 0
                        ? 'today'
                        : h.daysAgo === 1
                          ? 'yesterday'
                          : `${h.daysAgo}d ago`}
                    </span>
                    <span>·</span>
                    <Stars value={h.rating} size={10} />
                  </div>
                </div>
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: accent + '18' }}
                >
                  <FoodIcon name={r.sprites[0]} size={22} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="text-center pt-5 text-[11px] text-subtle">
        Made just for us · v1.0
      </div>

    </div>
  );
}
