// src/pages/StatsPage.tsx
import { Avatar, Card, FoodIcon } from '@/components/atoms';
import { Badge, KPI, ScreenHeader, Section } from '@/components/molecules';
import { CookingHeatmap, HeatLegend } from '@/components/organisms';
import { FOOD_GLYPHS, IcBook, IcFlame, IcStar, IcTarget } from '@/icons';
import { COUPLE, RECIPES, STATS } from '@/data/mock';
import { Rating } from '@/components/atoms';

export function StatsPage() {
  const alexShare = Math.round((STATS.byAlex / (STATS.byAlex + STATS.byYuka)) * 100);
  const yukaShare = 100 - alexShare;

  return (
    <div>
      <ScreenHeader title="Insights 📊" sub="Your cooking, by the numbers" />

      {/* Hero — total */}
      <div className="px-[18px] pt-1.5">
        <Card className="p-[22px] bg-accent text-white relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-5 -right-5 w-[100px] h-[100px] rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          />
          <div className="relative">
            <div className="text-xs font-semibold opacity-85 tracking-[0.3px] uppercase">
              Total meals together
            </div>
            <div className="text-[56px] font-extrabold tracking-[-2px] leading-none mt-2 mb-1 tabular-nums">
              {STATS.totalCooked}
            </div>
            <div className="text-[13px] opacity-90 mt-1.5">since {COUPLE.startedDate}</div>
          </div>
        </Card>
      </div>

      {/* KPIs */}
      <div className="px-[18px] pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          <KPI label="Day streak" value={STATS.streak} sub={`Best: ${STATS.longestStreak}`}
            color="#c2410c" tint="#fff1e5" Icon={IcFlame} />
          <KPI label="Avg rating" value={STATS.avgRating.toFixed(1)} sub="out of 5.0"
            color="#a16207" tint="#fef9c3" Icon={IcStar} filled />
          <KPI label="This week" value={`${STATS.weekCount}/${STATS.weekGoal}`} sub="goal in sight"
            color="#15803d" tint="#dcfce7" Icon={IcTarget} />
          <KPI label="Recipes" value={RECIPES.length} sub="saved together"
            color="#6d28d9" tint="#f3eefe" Icon={IcBook} />
        </div>
      </div>

      {/* Who cooks more */}
      <div className="px-[18px] pt-[22px]">
        <Section title="Who's cooking" padded={false} />
        <Card className="p-[18px] mt-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar who="alex" size={32} />
            <span className="text-sm font-bold text-ink">Alex</span>
            <span className="ml-auto text-sm font-bold text-ink">{STATS.byAlex}</span>
            <span className="text-xs text-muted">{alexShare}%</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-3 bg-canvas">
            <div className="rounded-full" style={{ flex: STATS.byAlex, background: '#7c3aed' }} />
            <div className="rounded-full -ml-1.5" style={{ flex: STATS.byYuka, background: '#ff7eb9' }} />
          </div>
          <div className="flex items-center gap-2.5">
            <Avatar who="yuka" size={32} />
            <span className="text-sm font-bold text-ink">Yuka</span>
            <span className="ml-auto text-sm font-bold text-ink">{STATS.byYuka}</span>
            <span className="text-xs text-muted">{yukaShare}%</span>
          </div>
        </Card>
      </div>

      {/* Cuisine mix */}
      <div className="px-[18px] pt-5">
        <Section title="What we love" padded={false} />
        <Card className="p-4 mt-3">
          <div className="flex h-3 rounded-full overflow-hidden mb-3.5">
            {STATS.cuisineMix.map((c) => (
              <div key={c.name} style={{ flex: c.pct, background: c.color }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {STATS.cuisineMix.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ background: c.color }} />
                <span className="text-[13px] text-ink font-semibold flex-1">{c.name}</span>
                <span className="text-xs text-muted font-semibold">{c.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <div className="px-[18px] pt-5">
        <Section
          title="Cooking activity"
          padded={false}
          action={<span className="text-xs text-muted">Last 12 weeks</span>}
        />
        <Card className="p-4 mt-3">
          <CookingHeatmap />
          <HeatLegend />
        </Card>
      </div>

      {/* Top recipes */}
      <div className="px-[18px] pt-5">
        <Section title="Most cooked" count={3} padded={false} />
        <div className="mt-3 flex flex-col gap-2">
          {STATS.topRecipes.map((id, i) => {
            const r = RECIPES.find((x) => x.id === id);
            if (!r) return null;
            const accent = FOOD_GLYPHS[r.sprites[0]].color;
            return (
              <Card key={id} className="p-3 flex items-center gap-3">
                <div className="text-[20px] font-extrabold text-subtle w-7">
                  {['🥇', '🥈', '🥉'][i]}
                </div>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: accent + '18' }}
                >
                  <FoodIcon name={r.sprites[0]} size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink">{r.name}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {r.cookedCount} cooks · <Rating value={r.rating.toFixed(1)} size={11} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="px-[18px] pt-5">
        <Section title="Badges" count="3 / 4" padded={false} />
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <Badge title="Streak Master"   sub="10 days in a row"  emoji="🔥" earned />
          <Badge title="Salmon Wizard"   sub="10× fish dishes"   emoji="🐟" earned />
          <Badge title="Italian Night"   sub="5 Italian recipes" emoji="🍝" earned />
          <Badge title="Brunch Royalty"  sub="Make 5 brunches"   emoji="🍳" progress={3} max={5} />
        </div>
      </div>

    </div>
  );
}
