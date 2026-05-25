import { FastifyPluginAsync } from 'fastify';

const statsRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /stats
  server.get('/', auth, async (request, reply) => {
    const { coupleId } = request.user;

    // All users in couple
    const users = await server.prisma.user.findMany({ where: { coupleId } });
    const userIds = users.map((u: any) => u.id);

    const allHistory = await server.prisma.historyEntry.findMany({
      where:   { byId: { in: userIds } },
      orderBy: { cookedAt: 'asc' },
      include: { recipe: true, by: true },
    });

    const totalCooked = allHistory.length;
    const avgRating   = totalCooked
      ? allHistory.reduce((s: number, h: any) => s + h.rating, 0) / totalCooked
      : 0;

    // Per-person counts
    const byAlex = allHistory.filter((h: any) => h.by.personId === 'alex').length;
    const byYuka = allHistory.filter((h: any) => h.by.personId === 'yuka').length;

    // Current streak — consecutive days with at least one cook
    const streak = calcStreak(allHistory);

    // This week count — Monday to Friday only
    const now = new Date();
    const daysSinceMonday = (now.getDay() + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysSinceMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekCount = allHistory.filter((h: any) => {
      const d   = new Date(h.cookedAt);
      const dow = d.getDay();
      return d >= weekStart && dow >= 1 && dow <= 5;
    }).length;

    const couple = await server.prisma.couple.findUnique({ where: { id: coupleId } });

    // Top recipes
    const recipeCounts: Record<string, number> = {};
    for (const h of allHistory) {
      recipeCounts[h.recipeId] = (recipeCounts[h.recipeId] ?? 0) + 1;
    }
    const topRecipes = Object.entries(recipeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);

    // Cuisine mix by tag
    const tagCounts: Record<string, number> = {};
    for (const h of allHistory) {
      const tag = h.recipe.tag;
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
    const tagColors: Record<string, string> = {
      Dinner: '#7c3aed',
      Brunch: '#db2777',
      Lunch:  '#0284c7',
      Weekday:'#16a34a',
      Snack:  '#d97706',
      AI:     '#6d28d9',
    };
    const cuisineMix = Object.entries(tagCounts).map(([name, count]) => ({
      name,
      pct:   Math.round((count / totalCooked) * 100),
      color: tagColors[name] ?? '#888',
    }));

    // Heatmap — last 90 days
    const { heatmap, heatmapRecipes } = buildHeatmap(allHistory);

    const longestStreak = calcLongestStreak(allHistory);

    return reply.send({
      totalCooked,
      streak,
      longestStreak,
      byAlex,
      byYuka,
      avgRating:    Math.round(avgRating * 10) / 10,
      weekCount,
      weekGoal:     couple?.weekGoal ?? 5,
      startedDate:  couple?.startedDate
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
  if (d.getDay() === 0) d.setDate(d.getDate() - 2); // skip Sun → Fri
  if (d.getDay() === 6) d.setDate(d.getDate() - 1); // skip Sat → Fri
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

  const today = new Date();
  let cursor = today.toISOString().split('T')[0];
  // If today is weekend, start from last Friday
  const todayDow = today.getDay();
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
    const expected = prevWeekday(uniqueDays[i]);
    if (expected === uniqueDays[i - 1]) {
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
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const counts: Record<string, number> = {};
  const recipes: Record<string, { id: string; name: string }[]> = {};

  for (const h of history) {
    if (h.cookedAt < cutoff) continue;
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
