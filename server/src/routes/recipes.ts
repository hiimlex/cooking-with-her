import { FastifyPluginAsync } from 'fastify';

const recipesRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /recipes
  server.get('/', auth, async (request, reply) => {
    const { tag, search, difficulty, timeMax, favorite } = request.query as {
      tag?: string; search?: string; difficulty?: string; timeMax?: string; favorite?: string;
    };

    const recipes = await server.prisma.recipe.findMany({
      where: {
        ...(tag        && { tag }),
        ...(difficulty && { difficulty }),
        ...(search     && { name: { contains: search, mode: 'insensitive' as const } }),
        ...(timeMax    && { time: { lte: parseInt(timeMax) } }),
        ...(favorite === 'true' && { favorite: true }),
      },
      include: {
        by:      true,
        sprites: true,
        // nutrition e steps não são usados nos cards — omitidos na lista
        ingredients: {
          select: {
            id:       true,
            qty:      true,
            unit:     true,
            optional: true,
            ingredient: {
              select: { id: true, qty: true, unit: true, alwaysAvailable: true },
            },
          },
          orderBy: { id: 'asc' },
        },
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

  // POST /recipes/from-ai
  server.post('/from-ai', auth, async (request, reply) => {
    const { userId } = request.user;

    const userExists = await server.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) return reply.status(401).send({ error: 'Sessão expirada. Faça login novamente.' });

    const body = request.body as {
      name: string; tag: string; time: number; difficulty: string;
      bg: string; accent: string; servings: number; why: string;
      sprites: string[];
      nutrition: { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
      ingredients: Array<{ name: string; qty: number; unit: string }>;
      steps: Array<{ title: string; desc: string; mins: number }>;
    };

    const allIngredients = await server.prisma.ingredient.findMany();
    const ingredientMap  = new Map(allIngredients.map((i) => [i.name.toLowerCase(), i]));

    const ingredientLinks = await Promise.all(
      body.ingredients.map(async (ing) => {
        let ingredient = ingredientMap.get(ing.name.toLowerCase());

        if (!ingredient) {
          const newId = ing.name
            .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
            + '-' + Date.now().toString(36);

          ingredient = await server.prisma.ingredient.create({
            data: { id: newId, name: ing.name, qty: ing.qty, unit: ing.unit, cat: 'Other', expiry: 365 },
          });
        }

        return { ingredientId: ingredient.id, qty: ing.qty, unit: ing.unit };
      }),
    );

    const recipe = await server.prisma.recipe.create({
      data: {
        name: body.name, tag: 'AI', time: body.time, difficulty: body.difficulty,
        bg: body.bg, accent: body.accent, servings: body.servings, why: body.why,
        isAI: true, byId: userId,
        sprites:     { create: (body.sprites ?? []).map((sprite: string) => ({ sprite })) },
        nutrition:   { create: body.nutrition },
        steps:       { create: body.steps.map((s, i) => ({ order: i + 1, ...s })) },
        ingredients: { create: ingredientLinks },
      },
      include: {
        sprites: true, nutrition: true, steps: { orderBy: { order: 'asc' } },
        by: true, ingredients: { include: { ingredient: true } },
      },
    });

    return reply.status(201).send(recipe);
  });

  // POST /recipes
  server.post('/', auth, async (request, reply) => {
    const { userId } = request.user;

    const userExists = await server.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) return reply.status(401).send({ error: 'Sessão expirada. Faça login novamente.' });

    const body = request.body as {
      name: string; tag: string; time: number; difficulty: string;
      bg: string; accent: string; servings?: number; why?: string; sprites?: string[];
      nutrition?: { kcal: number; protein: number; carbs: number; fat: number; fiber?: number };
      steps?:       Array<{ order: number; title: string; desc: string; mins: number }>;
      ingredients?: Array<{ ingredientId: string; qty: number; unit: string; optional?: boolean }>;
    };

    const recipe = await server.prisma.recipe.create({
      data: {
        name: body.name, tag: body.tag, time: body.time, difficulty: body.difficulty,
        bg: body.bg, accent: body.accent, servings: body.servings, why: body.why, byId: userId,
        sprites: body.sprites?.length
          ? { create: body.sprites.map((sprite) => ({ sprite })) } : undefined,
        nutrition: body.nutrition ? { create: body.nutrition } : undefined,
        steps: body.steps?.length ? { create: body.steps } : undefined,
        ingredients: body.ingredients?.length
          ? { create: body.ingredients.map(({ optional, ...i }) => ({ ...i, optional: optional ?? false })) }
          : undefined,
      },
      include: {
        sprites: true, nutrition: true, steps: true, by: true,
        ingredients: { include: { ingredient: true } },
      },
    });

    return reply.status(201).send(recipe);
  });

  // PUT /recipes/:id
  server.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string; tag?: string; time?: number; difficulty?: string;
      why?: string; servings?: number;
      steps?:       Array<{ title: string; desc: string; mins: number }>;
      ingredients?: Array<{ ingredientId: string; qty: number; unit: string; optional?: boolean }>;
    };

    const { steps, ingredients: ingBody, ...fields } = body;

    if (steps)   await server.prisma.recipeStep.deleteMany({ where: { recipeId: id } });
    if (ingBody) await server.prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });

    const recipe = await server.prisma.recipe.update({
      where: { id },
      data: {
        ...fields,
        ...(steps ? { steps: { create: steps.map((s, i) => ({ order: i + 1, ...s })) } } : {}),
        ...(ingBody ? {
          ingredients: {
            create: ingBody.map(({ optional, ...i }) => ({ ...i, optional: optional ?? false })),
          },
        } : {}),
      },
      include: {
        sprites: true, nutrition: true, steps: { orderBy: { order: 'asc' } },
        by: true, ingredients: { include: { ingredient: true } },
      },
    });

    return reply.send(recipe);
  });

  // DELETE /recipes/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    await server.prisma.recipe.delete({ where: { id } });
    return reply.status(204).send();
  });

  // PATCH /recipes/:id/favorite
  server.patch('/:id/favorite', auth, async (request, reply) => {
    const { id } = request.params as { id: string };

    const current = await server.prisma.recipe.findUnique({ where: { id }, select: { favorite: true } });
    if (!current) return reply.status(404).send({ error: 'Recipe not found' });

    const updated = await server.prisma.recipe.update({
      where: { id },
      data:  { favorite: !current.favorite },
      select: { id: true, favorite: true },
    });

    return reply.send(updated);
  });

  // POST /recipes/:id/finish — finaliza a receita: desconta estoque + registra histórico
  server.post('/:id/finish', auth, async (request, reply) => {
    const { id }     = request.params as { id: string };
    const { userId } = request.user;
    const { rating = 5, note, mealType = 'dinner', cookedAt } = request.body as { rating?: number; note?: string; mealType?: string; cookedAt?: string };

    const userExists = await server.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) return reply.status(401).send({ error: 'Sessão expirada. Faça login novamente.' });

    const recipe = await server.prisma.recipe.findUnique({
      where:   { id },
      include: { ingredients: { include: { ingredient: true } } },
    });
    if (!recipe) return reply.status(404).send({ error: 'Receita não encontrada' });

    // Hortaliças de uso imprevisível — quantidade variável, não descontar do estoque.
    // Regra: cat=Produce com exceção de batata e cenoura (medidas com precisão).
    const PRODUCE_EXCEPTIONS = ['batata', 'cenoura'];
    const isUntracked = (ri: typeof recipe.ingredients[0]) => {
      if (ri.ingredient.alwaysAvailable) return true;
      if (ri.ingredient.cat !== 'Produce') return false;
      const nameLower = ri.ingredient.name.toLowerCase();
      return !PRODUCE_EXCEPTIONS.some((ex) => nameLower.includes(ex));
    };

    // Descontar ingredientes — pula alwaysAvailable, opcionais e hortaliças genéricas.
    // ri.ingredient.qty já vem no include acima — sem N+1.
    await Promise.all(
      recipe.ingredients
        .filter((ri) => !isUntracked(ri) && !ri.optional)
        .map((ri) =>
          server.prisma.ingredient.update({
            where: { id: ri.ingredientId },
            data:  { qty: Math.max(0, ri.ingredient.qty - ri.qty) },
          }),
        ),
    );

    const [entry] = await Promise.all([
      server.prisma.historyEntry.create({
        data:    { recipeId: id, byId: userId, rating, note, mealType, ...(cookedAt ? { cookedAt: new Date(cookedAt) } : {}) },
        include: { recipe: { include: { sprites: true } }, by: true },
      }),
      server.prisma.recipe.update({
        where: { id },
        data:  { cookedCount: { increment: 1 }, rating },
      }),
    ]);

    return reply.status(201).send(entry);
  });

  // POST /recipes/:id/cook — log a cook session
  server.post('/:id/cook', auth, async (request, reply) => {
    const { id }     = request.params as { id: string };
    const { userId } = request.user;
    const { rating, note } = request.body as { rating: number; note?: string };

    const [entry] = await Promise.all([
      server.prisma.historyEntry.create({
        data: { recipeId: id, byId: userId, rating, note },
        include: { recipe: true, by: true },
      }),
      server.prisma.recipe.update({
        where: { id },
        data:  { cookedCount: { increment: 1 }, rating },
      }),
    ]);

    return reply.status(201).send(entry);
  });
};

export default recipesRoutes;
