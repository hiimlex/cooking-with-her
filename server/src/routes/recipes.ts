import { FastifyPluginAsync } from 'fastify';

// ─── Raw-SQL helpers for migration-added columns ──────────────────────────────
// Prisma client was generated before alwaysAvailable (Ingredient) and optional
// (RecipeIngredient) were added via applyMigrations(). We use $queryRawUnsafe /
// $executeRawUnsafe for those fields everywhere they're needed.

async function setRecipeIngredientOptional(
  prisma: any,
  recipeId: string,
  ingredients: Array<{ ingredientId: string; optional?: boolean }>,
) {
  await Promise.all(
    ingredients.map((i) =>
      prisma.$executeRawUnsafe(
        `UPDATE RecipeIngredient SET optional = ? WHERE recipeId = ? AND ingredientId = ?`,
        i.optional ? 1 : 0,
        recipeId,
        i.ingredientId,
      ),
    ),
  );
}

async function augmentRecipe(prisma: any, recipe: any): Promise<any> {
  if (!recipe?.ingredients?.length) return recipe;

  const ingredientIds = recipe.ingredients.map((ri: any) => ri.ingredient.id);
  const placeholders  = ingredientIds.map(() => '?').join(',');

  const [riRows, ingRows] = await Promise.all([
    prisma.$queryRawUnsafe<{ id: string; optional: number }[]>(
      `SELECT id, optional FROM RecipeIngredient WHERE recipeId = ?`,
      recipe.id,
    ),
    prisma.$queryRawUnsafe<{ id: string; alwaysAvailable: number }[]>(
      `SELECT id, alwaysAvailable FROM Ingredient WHERE id IN (${placeholders})`,
      ...ingredientIds,
    ),
  ]);

  const riMap  = Object.fromEntries(riRows.map((r) => [r.id, Boolean(r.optional)]));
  const ingMap = Object.fromEntries(ingRows.map((r) => [r.id, Boolean(r.alwaysAvailable)]));

  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ri: any) => ({
      ...ri,
      optional:   riMap[ri.id]             ?? false,
      ingredient: {
        ...ri.ingredient,
        alwaysAvailable: ingMap[ri.ingredient.id] ?? false,
      },
    })),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

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
        ...(search     && { name: { contains: search } }),
        ...(timeMax    && { time: { lte: parseInt(timeMax) } }),
        ...(favorite === 'true' && { favorite: true }),
      },
      include: {
        by:          true,
        sprites:     true,
        nutrition:   true,
        ingredients: { include: { ingredient: true }, orderBy: { id: 'asc' } },
        steps:       { orderBy: { order: 'asc' } },
        _count:      { select: { history: true } },
      },
      orderBy: { cookedCount: 'desc' },
    });

    // Augment all recipes in one pass
    const augmented = await Promise.all(recipes.map((r: any) => augmentRecipe(server.prisma, r)));
    return reply.send(augmented);
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
    return reply.send(await augmentRecipe(server.prisma, recipe));
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

    // Match or create pantry ingredients (via raw to pick up alwaysAvailable)
    const allRows = await server.prisma.$queryRawUnsafe<
      { id: string; name: string; qty: number; unit: string; alwaysAvailable: number }[]
    >(`SELECT id, name, qty, unit, alwaysAvailable FROM Ingredient`);
    const ingredientMap = new Map(allRows.map((i) => [i.name.toLowerCase(), i]));

    const ingredientLinks = await Promise.all(
      body.ingredients.map(async (ing) => {
        let ingredient = ingredientMap.get(ing.name.toLowerCase());

        if (!ingredient) {
          // Use pantry POST logic (raw insert)
          const newId = ing.name
            .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
            + '-' + Date.now().toString(36);
          await server.prisma.$executeRawUnsafe(
            `INSERT INTO Ingredient (id, name, qty, unit, cat, expiry, alwaysAvailable) VALUES (?, ?, ?, ?, 'Other', 365, 0)`,
            newId, ing.name, ing.qty, ing.unit,
          );
          ingredient = { id: newId, name: ing.name, qty: ing.qty, unit: ing.unit, alwaysAvailable: 0 };
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

    return reply.status(201).send(await augmentRecipe(server.prisma, recipe));
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

    // Strip `optional` — not known to Prisma client
    const prismaIngredients = (body.ingredients ?? []).map(({ optional: _opt, ...i }) => i);

    const recipe = await server.prisma.recipe.create({
      data: {
        name: body.name, tag: body.tag, time: body.time, difficulty: body.difficulty,
        bg: body.bg, accent: body.accent, servings: body.servings, why: body.why, byId: userId,
        sprites: body.sprites?.length
          ? { create: body.sprites.map((sprite) => ({ sprite })) } : undefined,
        nutrition: body.nutrition ? { create: body.nutrition } : undefined,
        steps: body.steps?.length
          ? { create: body.steps } : undefined,
        ingredients: prismaIngredients.length
          ? { create: prismaIngredients } : undefined,
      },
      include: {
        sprites: true, nutrition: true, steps: true, by: true,
        ingredients: { include: { ingredient: true } },
      },
    });

    // Now set optional flags via raw SQL
    if (body.ingredients?.length) {
      await setRecipeIngredientOptional(server.prisma, recipe.id, body.ingredients);
    }

    return reply.status(201).send(await augmentRecipe(server.prisma, recipe));
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

    // Strip `optional`
    const prismaIngredients = (ingBody ?? []).map(({ optional: _opt, ...i }) => i);

    const recipe = await server.prisma.recipe.update({
      where: { id },
      data: {
        ...fields,
        ...(steps ? { steps: { create: steps.map((s, i) => ({ order: i + 1, ...s })) } } : {}),
        ...(ingBody ? { ingredients: { create: prismaIngredients } } : {}),
      },
      include: {
        sprites: true, nutrition: true, steps: { orderBy: { order: 'asc' } },
        by: true, ingredients: { include: { ingredient: true } },
      },
    });

    if (ingBody?.length) {
      await setRecipeIngredientOptional(server.prisma, id, ingBody);
    }

    return reply.send(await augmentRecipe(server.prisma, recipe));
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

    const current = await server.prisma.recipe.findUnique({
      where: { id }, select: { favorite: true },
    });
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
    const { rating = 5, note } = request.body as { rating?: number; note?: string };

    const userExists = await server.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) return reply.status(401).send({ error: 'Sessão expirada. Faça login novamente.' });

    const recipe = await server.prisma.recipe.findUnique({
      where:   { id },
      include: { ingredients: { include: { ingredient: true } } },
    });
    if (!recipe) return reply.status(404).send({ error: 'Receita não encontrada' });

    // Fetch migration-added fields via raw SQL
    const augmented = await augmentRecipe(server.prisma, recipe);

    // Descontar ingredientes — pula alwaysAvailable e opcionais
    // Usa MAX(0, qty - deduct) para nunca deixar estoque negativo.
    await Promise.all(
      augmented.ingredients
        .filter((ing: any) => !ing.ingredient.alwaysAvailable && !ing.optional)
        .map((ing: any) =>
          server.prisma.$executeRawUnsafe(
            `UPDATE Ingredient SET qty = MAX(0, qty - ?) WHERE id = ?`,
            ing.qty,
            ing.ingredientId,
          ),
        ),
    );

    const [entry] = await Promise.all([
      server.prisma.historyEntry.create({
        data:    { recipeId: id, byId: userId, rating, note },
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
        data:  { cookedCount: { increment: 1 }, rating },
      }),
    ]);

    return reply.status(201).send(entry);
  });
};

export default recipesRoutes;
