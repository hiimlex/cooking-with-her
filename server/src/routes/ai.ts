import { FastifyPluginAsync } from 'fastify';

const aiRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // POST /ai/generate — Ask Nonna to suggest recipes
  // Body: { prompt: string; timeMinutes: number; tags: string[]; useWhatWeHave?: boolean }
  server.post('/generate', auth, async (request, reply) => {
    const body = request.body as {
      prompt: string;
      timeMinutes: number;
      tags: string[];
      useWhatWeHave?: boolean;
    };

    // Fetch pantry for context
    const pantry = await server.prisma.ingredient.findMany({
      orderBy: { expiry: 'asc' },
    });

    // Base filter: respect timeMinutes constraint
    const candidates = await server.prisma.recipe.findMany({
      where: {
        time: { lte: body.timeMinutes },
        ...(body.tags.includes('spicy') ? {} : {}),
      },
      include: {
        sprites:     true,
        nutrition:   true,
        ingredients: { include: { ingredient: true } },
        steps:       { orderBy: { order: 'asc' } },
        by:          true,
      },
      orderBy: { rating: 'desc' },
      take: 10,
    });

    // Score recipes by pantry coverage when useWhatWeHave is set
    const pantryIds = new Set(pantry.map((i: any) => i.id));

    const scored = candidates.map((recipe: any) => {
      const recipeIngIds = recipe.ingredients.map((ri: any) => ri.ingredientId);
      const covered      = recipeIngIds.filter((id: string) => pantryIds.has(id)).length;
      const coverage     = recipeIngIds.length ? covered / recipeIngIds.length : 0;
      return { ...recipe, _score: body.useWhatWeHave ? coverage : recipe.rating };
    });

    const results = scored
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 3)
      .map(({ _score, ...recipe }: any) => recipe);

    return reply.send({
      results,
      context: {
        pantryItems:   pantry.length,
        expiringItems: pantry.filter((i: any) => i.expiry <= 4).length,
      },
    });
  });

  // GET /ai/tags — available filter tags for Ask Nonna
  server.get('/tags', auth, async (_request, reply) => {
    const tags = [
      { id: 'lazy-sunday',    label: 'Lazy Sunday',   group: 'mood'   },
      { id: 'date-night',     label: 'Date night',    group: 'mood'   },
      { id: 'comfort-food',   label: 'Comfort food',  group: 'mood'   },
      { id: 'light-healthy',  label: 'Light & healthy',group: 'mood'  },
      { id: 'spicy',          label: 'Spicy',         group: 'flavor' },
      { id: 'use-what-we-have',label: 'Use what we have', group: 'mode'},
      { id: 'surprise-us',    label: 'Surprise us',   group: 'mode'   },
      { id: 'quick',          label: '< 20 min',      group: 'time'   },
    ];

    return reply.send(tags);
  });
};

export default aiRoutes;
