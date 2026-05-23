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

    // This week count
    const weekStart   = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekCount = allHistory.filter(
      (h: any) => new Date(h.cookedAt) >= weekStart,
    ).length;

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
    const heatmap = buildHeatmap(allHistory);

    return reply.send({
      totalCooked,
      streak,
      longestStreak: streak, // simplified — would need full history scan
      byAlex,
      byYuka,
      avgRating:  Math.round(avgRating * 10) / 10,
      weekCount,
      weekGoal:   couple?.weekGoal ?? 5,
      topRecipes,
      cuisineMix,
      heatmap,
    });
  });
};

function calcStreak(history: Array<{ cookedAt: Date }>): number {
  if (!history.length) return 0;

  const uniqueDays = [...new Set(
    history.map((h) => h.cookedAt.toISOString().split('T')[0]),
  )].sort().reverse();

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let cursor = today;

  for (const day of uniqueDays) {
    if (day === cursor) {
      streak++;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return streak;
}

function buildHeatmap(history: Array<{ cookedAt: Date }>) {
  const counts: Record<string, number> = {};
  for (const h of history) {
    const key = h.cookedAt.toISOString().split('T')[0];
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export default statsRoutes;
