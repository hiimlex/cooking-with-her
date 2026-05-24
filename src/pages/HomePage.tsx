import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Chip, FoodIcon, Input, Rating } from '@/components/atoms';
import { RecipeCard, Section } from '@/components/molecules';
import { IcChevRight, IcSearch, IcSparkle } from '@/icons';
import { FOOD_GLYPHS } from '@/icons';
import { useHomeData } from '@/hooks/useHomeData';

const FILTERS = [
  { id: 'all',    label: 'All' },
  { id: 'quick',  label: 'Quick' },
  { id: 'Dinner', label: 'Dinner' },
  { id: 'Brunch', label: 'Brunch' },
  { id: 'Lunch',  label: 'Lunch' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { recipes, latestEntry, isLoading } = useHomeData(filter, search);

  const entryAccent = latestEntry
    ? FOOD_GLYPHS[latestEntry.recipeSprite]?.color ?? '#888'
    : '#888';

  return (
    <div>
      {/* Header */}
      <div className="pt-[54px] px-[18px] pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="min-w-0">
            <div className="text-[13px] text-muted">Hi Alex & Yuka</div>
            <h1 className="m-0 mt-0.5 text-[26px] font-extrabold text-ink tracking-[-0.6px]">
              Easy to cook menu
            </h1>
          </div>
          <div className="flex">
            <div className="-mr-2.5"><Avatar who="alex" size={36} ring /></div>
            <Avatar who="yuka" size={36} ring />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-[18px] pb-[18px]">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            <IcSearch size={16} />
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your perfect recipe"
            className="pl-[42px]"
          />
        </div>
      </div>

      {/* Ask Nonna */}
      <div className="px-[18px] pb-[22px]">
        <button
          onClick={() => navigate('/ai')}
          className="w-full text-left bg-accent text-white rounded-[20px] px-[18px] py-4 flex items-center gap-3.5"
        >
          <div
            className="w-[42px] h-[42px] rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            <IcSparkle size={20} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold opacity-85">Ask Nonna</div>
            <div className="text-[17px] font-extrabold tracking-[-0.3px]">What should we cook?</div>
          </div>
          <IcChevRight size={18} />
        </button>
      </div>

      {/* Yesterday's cook */}
      {latestEntry && (
        <div className="px-[18px] pb-[18px]">
          <Section title="Yesterday's cook" padded={false} />
          <div className="mt-3">
            <Card onClick={() => navigate(`/recipe/${latestEntry.recipeId}`)} className="p-3.5 flex items-center gap-3.5">
              <div
                className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: entryAccent + '18' }}
              >
                <FoodIcon name={latestEntry.recipeSprite} size={36} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold text-ink tracking-[-0.2px] mb-1">
                  {latestEntry.recipeName}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Avatar who={latestEntry.by} size={16} />
                    {latestEntry.byName}
                  </span>
                  <span className="w-[3px] h-[3px] rounded-full bg-subtle" />
                  <Rating value={latestEntry.rating.toFixed(1)} size={12} />
                </div>
              </div>
              <IcChevRight size={16} className="text-subtle" />
            </Card>
          </div>
        </div>
      )}

      {/* Category */}
      <div className="px-[18px] pb-3">
        <Section title="Category" padded={false} />
      </div>
      <div className="flex gap-2 px-[18px] pb-[18px] overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</Chip>
        ))}
      </div>

      {/* Popular */}
      <div className="px-[18px] pb-1">
        <Section title="Popular" count={recipes.length} padded={false} />
      </div>
      {isLoading ? (
        <div className="px-[18px] pt-3 text-muted text-sm">Loading...</div>
      ) : (
        <div className="px-[18px] pt-3 grid grid-cols-2 gap-3">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
