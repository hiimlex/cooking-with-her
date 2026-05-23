import { FastifyPluginAsync } from 'fastify';

const recipesRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /recipes?tag=&search=&difficulty=&timeMax=
  server.get('/', auth, async (request, reply) => {
    const { tag, search, difficulty, timeMax } = request.query as {
      tag?: string;
      search?: string;
      difficulty?: string;
      timeMax?: string;
    };

    const recipes = await server.prisma.recipe.findMany({
      where: {
        ...(tag        && { tag }),
        ...(difficulty && { difficulty }),
        ...(search     && { name: { contains: search } }),
        ...(timeMax    && { time: { lte: parseInt(timeMax) } }),
      },
      include: {
        by:          true,
        sprites:     true,
        nutrition:   true,
        ingredients: { include: { ingredient: true } },
        steps:       { orderBy: { order: 'asc' } },
        _count:      { select: { history: true } },
      },
      orderBy: { cookedCount: 'desc' },
    });

    return reply.send(recipes);
  });

  // GET /recipes/:id
  server.get('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };

    const recipe = await server.prisma.recipe.findUnique({
      where: { id },
      include: {
        by:          true,
        sprites:     true,
        nutrition:   true,
        ingredients: { include: { ingredient: true } },
        steps:       { orderBy: { order: 'asc' } },
        history: {
          take:    5,
          orderBy: { cookedAt: 'desc' },
          include: { by: true },
        },
      },
    });

    if (!recipe) return reply.status(404).send({ error: 'Recipe not found' });

    return reply.send(recipe);
  });

  // POST /recipes
  server.post('/', auth, async (request, reply) => {
    const { userId } = request.user;
    const body = request.body as {
      name: string;
      tag: string;
      time: number;
      difficulty: string;
      bg: string;
      accent: string;
      servings?: number;
      why?: string;
      sprites?: string[];
      nutrition?: { kcal: number; protein: number; carbs: number; fat: number; fiber?: number };
      steps?: Array<{ order: number; title: string; desc: string; mins: number }>;
    };

    const recipe = await server.prisma.recipe.create({
      data: {
        name:       body.name,
        tag:        body.tag,
        time:       body.time,
        difficulty: body.difficulty,
        bg:         body.bg,
        accent:     body.accent,
        servings:   body.servings,
        why:        body.why,
        byId:       userId,
        sprites: body.sprites?.length
          ? { create: body.sprites.map((sprite) => ({ sprite })) }
          : undefined,
        nutrition: body.nutrition
          ? { create: body.nutrition }
          : undefined,
        steps: body.steps?.length
          ? { create: body.steps }
          : undefined,
      },
      include: { sprites: true, nutrition: true, steps: true, by: true },
    });

    return reply.status(201).send(recipe);
  });

  // PUT /recipes/:id
  server.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      tag?: string;
      time?: number;
      difficulty?: string;
      why?: string;
      servings?: number;
    };

    const recipe = await server.prisma.recipe.update({
      where: { id },
      data:  body,
    });

    return reply.send(recipe);
  });

  // DELETE /recipes/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    await server.prisma.recipe.delete({ where: { id } });
    return reply.status(204).send();
  });

  // POST /recipes/:id/cook — log a cook session
  server.post('/:id/cook', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.user;
    const { rating, note } = request.body as { rating: number; note?: string };

    const [entry] = await Promise.all([
      server.prisma.historyEntry.create({
        data: { recipeId: id, byId: userId, rating, note },
        include: { recipe: true, by: true },
      }),
      server.prisma.recipe.update({
        where: { id },
        data: {
          cookedCount: { increment: 1 },
          // Recalculate average rating via raw update; simple approach here
          rating,
        },
      }),
    ]);

    return reply.status(201).send(entry);
  });
};

export default recipesRoutes;
