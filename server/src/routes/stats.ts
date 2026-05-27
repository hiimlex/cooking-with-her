import { FastifyPluginAsync } from 'fastify';

const statsRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /stats
  server.get('/', auth, async (request, reply) => {
    const { coupleId } = request.user;

    // Step 1 — users + couple in parallel (no userIds needed yet)
    const [users, couple] = await Promise.all([
      server.prisma.user.findMany({
        where:  { coupleId },
        select: { id: true, personId: true },
      }),
      server.prisma.couple.findUnique({
        where:  { id: coupleId },
        select: { weekGoal: true, startedDate: true },
      }),
    ]);

    const userIds = users.map((u: any) => u.id);

    // Week boundaries (Mon–Fri only)
    const now = new Date();
    const daysSinceMonday = (now.getDay() + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysSinceMonday);
    weekStart.setHours(0, 0, 0, 0);

    // 90-day cutoff for heatmap
    const cutoff90 = new Date();
    cutoff90.setDate(cutoff90.getDate() - 90);

    // Step 2 — parallel queries, all using indexes, minimal data transferred
    const [
      dinnerAggregate,
      dinnerByPerson,
      dinnerDates,      // only cookedAt — for streak + weekCount
      topRecipesRaw,    // groupBy recipeId
      cuisineTagsRaw,   // only recipe.tag
      heatmapEntries,   // last 90 days — cookedAt + recipe.{id,name}
    ] = await Promise.all([

      // Total dinners + avg rating — single aggregate, no rows returned
      server.prisma.historyEntry.aggregate({
        where: { byId: { in: userIds }, mealType: 'dinner' },
        _count: { _all: true },
        _avg:   { rating: true },
      }),

      // Per-person dinner counts — groupBy, no rows
      server.prisma.historyEntry.groupBy({
        by:    ['byId'],
        where: { byId: { in: userIds }, mealType: 'dinner' },
        _count: { _all: true },
      }),

      // Only dates for streak/weekCount — tiny payload
      server.prisma.historyEntry.findMany({
        where:   { byId: { in: userIds }, mealType: 'dinner' },
        select:  { cookedAt: true },
        orderBy: { cookedAt: 'asc' },
      }),

      // Top 3 recipes by cook count — groupBy, no recipe rows
      server.prisma.historyEntry.groupBy({
        by:     ['recipeId'],
        where:  { byId: { in: userIds }, mealType: 'dinner' },
        _count: { _all: true },
        orderBy: { _count: { recipeId: 'desc' } },
        take:   3,
      }),

      // Cuisine mix — only tag, no other recipe fields
      server.prisma.historyEntry.findMany({
        where:  { byId: { in: userIds }, mealType: 'dinner' },
        select: { recipe: { select: { tag: true } } },
      }),

      // Heatmap — last 90 days, all meal types, minimal fields
      server.prisma.historyEntry.findMany({
        where:   { byId: { in: userIds }, cookedAt: { gte: cutoff90 } },
        select:  { cookedAt: true, recipe: { select: { id: true, name: true } } },
        orderBy: { cookedAt: 'asc' },
      }),
    ]);

    // Derived values
    const totalCooked = dinnerAggregate._count._all;
    const avgRating   = dinnerAggregate._avg.rating ?? 0;

    const alexId = users.find((u: any) => u.personId === 'alex')?.id;
    const yukaId = users.find((u: any) => u.personId === 'yuka')?.id;
    const byAlex = dinnerByPerson.find((r: any) => r.byId === alexId)?._count._all ?? 0;
    const byYuka = dinnerByPerson.find((r: any) => r.byId === yukaId)?._count._all ?? 0;

    const streak        = calcStreak(dinnerDates);
    const longestStreak = calcLongestStreak(dinnerDates);

    // Week count — Mon–Fri filter in JS (no raw SQL needed, dinnerDates is already small)
    const weekCount = dinnerDates.filter((h: any) => {
      const d   = new Date(h.cookedAt);
      const dow = d.getDay();
      return d >= weekStart && dow >= 1 && dow <= 5;
    }).length;

    const topRecipes = topRecipesRaw.map((r: any) => r.recipeId);

    // Cuisine mix
    const tagColors: Record<string, string> = {
      Dinner: '#7c3aed', Brunch: '#db2777', Lunch: '#0284c7',
      Weekday: '#16a34a', Snack: '#d97706', AI: '#6d28d9',
    };
    const tagCounts: Record<string, number> = {};
    for (const h of cuisineTagsRaw) {
      const tag = (h as any).recipe.tag;
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
    const cuisineMix = Object.entries(tagCounts).map(([name, count]) => ({
      name,
      pct:   Math.round((count / (totalCooked || 1)) * 100),
      color: tagColors[name] ?? '#888',
    }));

    const { heatmap, heatmapRecipes } = buildHeatmap(heatmapEntries as any);

    return reply.send({
      totalCooked,
      streak,
      longestStreak,
      byAlex,
      byYuka,
      avgRating:   Math.round(avgRating * 10) / 10,
      weekCount,
      weekGoal:    couple?.weekGoal ?? 5,
      startedDate: couple?.startedDate
        ? new Date(couple.startedDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
        : undefined,
      topRecipes,
      cuisineMix,
      heatmap,
      heatmapRecipes,
    });
  });
};

function prevWeekday(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  if (d.getDay() === 0) d.setDate(d.getDate() - 2);
  if (d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function calcStreak(history: Array<{ cookedAt: Date }>): number {
  if (!history.length) return 0;

  const weekdayCooks = history.filter((h) => {
    const dow = h.cookedAt.getDay();
    return dow >= 1 && dow <= 5;
  });
  if (!weekdayCooks.length) return 0;

  const uniqueDays = [...new Set(
    weekdayCooks.map((h) => h.cookedAt.toISOString().split('T')[0]),
  )].sort().reverse();

  const today    = new Date();
  const todayDow = today.getDay();
  let cursor     = today.toISOString().split('T')[0];
  if (todayDow === 0) { const f = new Date(today); f.setDate(f.getDate() - 2); cursor = f.toISOString().split('T')[0]; }
  if (todayDow === 6) { const f = new Date(today); f.setDate(f.getDate() - 1); cursor = f.toISOString().split('T')[0]; }

  let streak = 0;
  for (const day of uniqueDays) {
    if (day === cursor) {
      streak++;
      cursor = prevWeekday(cursor);
    } else if (day < cursor) {
      break;
    }
  }
  return streak;
}

function calcLongestStreak(history: Array<{ cookedAt: Date }>): number {
  if (!history.length) return 0;

  const weekdayCooks = history.filter((h) => {
    const dow = h.cookedAt.getDay();
    return dow >= 1 && dow <= 5;
  });
  if (!weekdayCooks.length) return 0;

  const uniqueDays = [...new Set(
    weekdayCooks.map((h) => h.cookedAt.toISOString().split('T')[0]),
  )].sort();

  let longest = 1;
  let current = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (prevWeekday(uniqueDays[i]) === uniqueDays[i - 1]) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

function buildHeatmap(history: Array<{ cookedAt: Date; recipe: { id: string; name: string } }>): {
  heatmap: Record<string, number>;
  heatmapRecipes: Record<string, { id: string; name: string }[]>;
} {
  const counts:  Record<string, number>                    = {};
  const recipes: Record<string, { id: string; name: string }[]> = {};

  for (const h of history) {
    const key = h.cookedAt.toISOString().split('T')[0];
    counts[key] = (counts[key] ?? 0) + 1;
    if (!recipes[key]) recipes[key] = [];
    if (!recipes[key].some((r) => r.id === h.recipe.id)) {
      recipes[key].push({ id: h.recipe.id, name: h.recipe.name });
    }
  }

  return { heatmap: counts, heatmapRecipes: recipes };
}

export default statsRoutes;
