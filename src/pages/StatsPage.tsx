import { useNavigate } from "react-router-dom";
import { Avatar, Card, FoodIcon, Rating } from "@/components/atoms";
import { KPI, ScreenHeader, Section } from "@/components/molecules";
import { CookingHeatmap, HeatLegend } from "@/components/organisms";
import { useStatsData } from "@/hooks/useStatsData";
import { FOOD_GLYPHS, IcBook, IcFlame, IcStar, IcTarget } from "@/icons";
import type { FoodGlyphId } from "@/types";

export function StatsPage() {
  const navigate = useNavigate();
  const { stats, topRecipes, uniqueRecipesCount, isLoading } = useStatsData();

  if (isLoading || !stats) {
    return (
      <div className="px-[18px] pt-4 flex flex-col gap-3">
        <div className="h-8 w-48 bg-canvas rounded-xl animate-pulse" />
        <div className="h-[110px] bg-canvas rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[100px] bg-canvas rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const totalCooks = stats.byAlex + stats.byYuka;
  const alexShare =
    totalCooks > 0 ? Math.round((stats.byAlex / totalCooks) * 100) : 50;
  const yukaShare = 100 - alexShare;

  return (
    <div>
      <ScreenHeader title="Estatísticas" sub="Suas cozinhadas em números" />

      {/* KPIs */}
      <div className="px-[18px] pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          <KPI
            label="Sequência"
            value={stats.streak}
            sub={`Recorde: ${stats.longestStreak}`}
            color="#c2410c"
            tint="#fff1e5"
            Icon={IcFlame}
          />
          <KPI
            label="Nota média"
            value={stats.avgRating.toFixed(1)}
            sub="de 5.0"
            color="#a16207"
            tint="#fef9c3"
            Icon={IcStar}
            filled
          />
          <KPI
            label="Esta semana"
            value={`${stats.weekCount}/${stats.weekGoal}`}
            sub="meta próxima"
            color="#15803d"
            tint="#dcfce7"
            Icon={IcTarget}
          />
          <KPI
            label="Receitas"
            value={uniqueRecipesCount}
            sub="feitas juntos"
            color="#6d28d9"
            tint="#f3eefe"
            Icon={IcBook}
          />
        </div>
      </div>

      {/* Who cooks more */}
      <div className="px-[18px] pt-[22px]">
        <Section title="Quem cozinha mais" padded={false} />
        <Card className="p-[18px] mt-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar who="alex" size={32} />
            <span className="text-sm font-bold text-ink">Alex</span>
            <span className="ml-auto text-sm font-bold text-ink">
              {stats.byAlex}
            </span>
            <span className="text-xs text-muted">{alexShare}%</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-3 bg-canvas">
            <div
              className="rounded-full"
              style={{ flex: stats.byAlex, background: "#7c3aed" }}
            />
            <div
              className="rounded-full -ml-1.5"
              style={{ flex: stats.byYuka, background: "#ff7eb9" }}
            />
          </div>
          <div className="flex items-center gap-2.5">
            <Avatar who="yuka" size={32} />
            <span className="text-sm font-bold text-ink">Yuka</span>
            <span className="ml-auto text-sm font-bold text-ink">
              {stats.byYuka}
            </span>
            <span className="text-xs text-muted">{yukaShare}%</span>
          </div>
        </Card>
      </div>

      {/* Cuisine mix */}
      {stats.cuisineMix.length > 0 && (
        <div className="px-[18px] pt-5">
          <Section title="O que amamos" padded={false} />
          <Card className="p-4 mt-3">
            <div className="flex h-3 rounded-full overflow-hidden mb-3.5">
              {stats.cuisineMix.map((c) => (
                <div
                  key={c.name}
                  style={{ flex: c.pct, background: c.color }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {stats.cuisineMix.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ background: c.color }}
                  />
                  <span className="text-[13px] text-ink font-semibold flex-1">
                    {c.name}
                  </span>
                  <span className="text-xs text-muted font-semibold">
                    {c.pct}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Heatmap */}
      <div className="px-[18px] pt-5">
        <Section
          title="Atividade"
          padded={false}
          action={<span className="text-xs text-muted">Últimas 12 semanas</span>}
        />
        <Card className="p-4 mt-3">
          <CookingHeatmap
            data={stats.heatmap}
            recipes={stats.heatmapRecipes}
            onRecipePress={(id) => navigate(`/recipe/${id}`)}
          />
          <HeatLegend />
        </Card>
      </div>

      {/* Top recipes */}
      {topRecipes.length > 0 && (
        <div className="px-[18px] pt-5">
          <Section
            title="Mais cozinhadas"
            count={topRecipes.length}
            padded={false}
          />
          <div className="mt-3 flex flex-col gap-2">
            {topRecipes.map(({ recipe, count, totalRating }, i) => {
              const spriteId = (recipe.sprites[0]?.sprite ??
                "Tomato") as FoodGlyphId;
              const glyph = FOOD_GLYPHS[spriteId];
              const avgRating =
                count > 0 ? (totalRating / count).toFixed(1) : "—";
              return (
                <Card key={recipe.id} className="p-3 flex items-center gap-3">
                  <div className="text-[13px] font-extrabold text-subtle w-7 tabular-nums">
                    #{i + 1}
                  </div>
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: (glyph?.color ?? recipe.accent) + "18",
                    }}
                  >
                    <FoodIcon name={spriteId} size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-ink truncate">
                      {recipe.name}
                    </div>
                    <div className="text-xs text-muted mt-0.5 flex items-center gap-1">
                      {count}× cozinhada · <Rating value={avgRating} size={11} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
