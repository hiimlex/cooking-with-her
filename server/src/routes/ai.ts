import { FastifyPluginAsync } from 'fastify';
import {
  generateRecipe, improveSteps, improveRecipe, GeminiError,
  adjustIngredientInRecipes,
  type RecipeIngredientContext,
} from '../services/gemini';

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const aiRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // POST /ai/generate
  // Body: { prompt: string; timeMinutes: number; tags: string[]; useWhatWeHave?: boolean }
  server.post('/generate', auth, async (request, reply) => {
    const body = request.body as {
      prompt:        string;
      timeMinutes:   number;
      tags:          string[];
      useWhatWeHave?: boolean;
    };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return reply.status(503).send({
        error: 'GROQ_API_KEY não configurada. Adicione a chave no .env do servidor.',
      });
    }

    // ── Buscar contexto do banco ────────────────────────────────────────────
    const [pantry, candidates] = await Promise.all([
      server.prisma.ingredient.findMany({ orderBy: { expiry: 'asc' } }),

      server.prisma.recipe.findMany({
        where: { time: { lte: body.timeMinutes } },
        include: {
          sprites:     true,
          nutrition:   true,
          ingredients: { include: { ingredient: true } },
          steps:       { orderBy: { order: 'asc' } },
          by:          true,
        },
        orderBy: { rating: 'desc' },
        take: 12,
      }),
    ]);

    const geminiInput = {
      pantry:     pantry.map((i: any) => ({
        id:     i.id,
        name:   i.name,
        qty:    i.qty,
        unit:   i.unit,
        cat:    i.cat,
        expiry: i.expiry,
      })),
      recipes:    candidates.map((r: any) => ({
        id:          r.id,
        name:        r.name,
        tag:         r.tag,
        time:        r.time,
        difficulty:  r.difficulty,
        rating:      r.rating,
        servings:    r.servings,
        ingredients: r.ingredients.map((ri: any) => ({
          name: ri.ingredient.name,
          qty:  ri.qty,
          unit: ri.unit,
        })),
      })),
      userPrompt:     body.prompt ?? '',
      timeLimit:      body.timeMinutes,
      tags:           body.tags ?? [],
      useWhatWeHave:  body.useWhatWeHave ?? true,
    };

    const context = {
      pantryItems:   pantry.length,
      expiringItems: pantry.filter((i: any) => i.expiry <= 4).length,
    };

    try {
      const generated = await generateRecipe(apiKey, geminiInput);
      return reply.send({ mode: 'generated', recipe: generated.recipe, context });

    } catch (err) {
      if (err instanceof GeminiError) {
        const status = err.statusCode === 429 ? 429
          : err.statusCode === 401 || err.statusCode === 403 ? 503
          : 502;
        return reply.status(status).send({ error: err.message });
      }
      throw err;
    }
  });

  // POST /ai/improve-steps
  server.post('/improve-steps', auth, async (request, reply) => {
    const body = request.body as {
      recipeName:   string;
      steps?:       Array<{ title: string; desc: string; mins: number }>;
      ingredients?: Array<{ name: string; qty: number; unit: string }>;
      tag?:         string;
      time?:        number;
      difficulty?:  string;
      servings?:    number;
    };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return reply.status(503).send({
        error: 'GROQ_API_KEY não configurada.',
      });
    }

    try {
      const result = await improveSteps(apiKey, {
        recipeName:  body.recipeName,
        steps:       body.steps,
        ingredients: body.ingredients,
        tag:         body.tag,
        time:        body.time,
        difficulty:  body.difficulty,
        servings:    body.servings,
      });
      return reply.send(result);
    } catch (err) {
      if (err instanceof GeminiError) {
        const status = err.statusCode === 429 ? 429
          : err.statusCode === 401 || err.statusCode === 403 ? 503
          : 502;
        return reply.status(status).send({ error: err.message });
      }
      throw err;
    }
  });

  // POST /ai/improve-recipe
  server.post('/improve-recipe', auth, async (request, reply) => {
    const body = request.body as { recipeName: string };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return reply.status(503).send({ error: 'GROQ_API_KEY não configurada.' });
    }

    const pantry = await server.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });

    try {
      const result = await improveRecipe(apiKey, {
        recipeName: body.recipeName,
        pantry: pantry.map((i: any) => ({
          name: i.name, qty: i.qty, unit: i.unit, cat: i.cat,
        })),
      });

      // Match AI ingredient names against pantry using accent-insensitive comparison
      const enrichedIngredients = result.recipe.ingredients.map((ing) => {
        const norm  = normalizeForMatch(ing.name);
        const match = pantry.find((p: any) => {
          const pn = normalizeForMatch(p.name);
          return pn === norm || pn.includes(norm) || norm.includes(pn);
        });
        return {
          name:         ing.name,
          qty:          ing.qty,
          unit:         ing.unit,
          ingredientId: match?.id   ?? null,
          stockQty:     match?.qty  ?? null,
          unit_stock:   match?.unit ?? null,
          notInPantry:  !match,
        };
      });

      return reply.send({ recipe: { ...result.recipe, ingredients: enrichedIngredients } });
    } catch (err) {
      if (err instanceof GeminiError) {
        const status = err.statusCode === 429 ? 429
          : err.statusCode === 401 || err.statusCode === 403 ? 503
          : 502;
        return reply.status(status).send({ error: err.message });
      }
      throw err;
    }
  });

  // GET /ai/ingredient-sync?ingredientId=xxx&oldUnit=yyy
  // SSE stream: reviews all recipe usages of an ingredient after a unit change.
  server.get('/ingredient-sync', auth, async (request, reply) => {
    const { ingredientId, oldUnit } = request.query as { ingredientId: string; oldUnit: string };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return reply.status(503).send({ error: 'GROQ_API_KEY não configurada.' });
    }

    const raw = reply.raw;

    // CORS headers must be set manually — reply.raw bypasses @fastify/cors hooks.
    const origin = request.headers.origin;
    if (origin) {
      raw.setHeader('Access-Control-Allow-Origin',      origin);
      raw.setHeader('Access-Control-Allow-Credentials', 'true');
      raw.setHeader('Vary', 'Origin');
    }

    raw.setHeader('Content-Type',      'text/event-stream; charset=utf-8');
    raw.setHeader('Cache-Control',     'no-cache, no-transform');
    raw.setHeader('Connection',        'keep-alive');
    raw.setHeader('X-Accel-Buffering', 'no');
    raw.flushHeaders?.();

    const send = (payload: object) =>
      raw.write(`data: ${JSON.stringify(payload)}\n\n`);

    // Compatible unit pairs — the math cascade in PUT /pantry/:id already converted
    // these perfectly. No AI needed; just confirm each recipe as-is.
    const MATH_PAIRS: Record<string, string> = {
      g: 'kg', kg: 'g', ml: 'L', L: 'ml',
    };

    try {
      const ingredient = await server.prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      if (!ingredient) {
        send({ error: 'Ingrediente não encontrado' });
        raw.end();
        return reply;
      }

      const newUnit = ingredient.unit;

      const recipeIngredients = await server.prisma.recipeIngredient.findMany({
        where: { ingredientId },
        include: {
          recipe: {
            include: {
              ingredients: { include: { ingredient: true } },
            },
          },
        },
      });

      if (recipeIngredients.length === 0) {
        send({ done: true, count: 0 });
        raw.end();
        return reply;
      }

      send({ total: recipeIngredients.length });

      // ── Compatible conversion: math cascade already ran → confirm each recipe ──
      if (MATH_PAIRS[oldUnit] === newUnit) {
        for (const ri of recipeIngredients) {
          send({
            recipeId:   ri.recipe.id,
            recipeName: ri.recipe.name,
            qty:        ri.qty,
            unit:       ri.unit,
            noChange:   true,
            reason:     null,
          });
        }
        send({ done: true, count: 0 });
        raw.end();
        return reply;
      }

      // ── Incompatible conversion: ask AI to handle best-effort ─────────────────
      const contexts: RecipeIngredientContext[] = recipeIngredients.map((ri) => ({
        recipeId:       ri.recipe.id,
        recipeName:     ri.recipe.name,
        servings:       ri.recipe.servings,
        currentQty:     ri.qty,
        currentUnit:    ri.unit,
        allIngredients: ri.recipe.ingredients.map((i) => ({
          name: i.ingredient.name,
          qty:  i.qty,
          unit: i.unit,
        })),
      }));

      const result = await adjustIngredientInRecipes(
        apiKey,
        { name: ingredient.name, oldUnit, newUnit },
        contexts,
      );

      for (const adj of result.adjustments) {
        await server.prisma.recipeIngredient.updateMany({
          where: { ingredientId, recipeId: adj.recipeId },
          data:  { qty: adj.qty, unit: adj.unit },
        });

        const recipeName = recipeIngredients.find(
          (ri) => ri.recipe.id === adj.recipeId,
        )?.recipe.name ?? adj.recipeId;

        send({
          recipeId:   adj.recipeId,
          recipeName,
          qty:        adj.qty,
          unit:       adj.unit,
          noChange:   adj.noChange,
          reason:     adj.reason ?? null,
        });
      }

      send({ done: true, count: result.adjustments.filter((a) => !a.noChange).length });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      send({ error: msg });
    }

    raw.end();
    return reply;
  });

  // GET /ai/tags
  server.get('/tags', auth, async (_request, reply) => {
    const tags = [
      { id: 'lazy-sunday',      label: 'Domingo preguiçoso', group: 'mood'   },
      { id: 'date-night',       label: 'Jantar a dois',      group: 'mood'   },
      { id: 'comfort-food',     label: 'Comida de conforto', group: 'mood'   },
      { id: 'light-healthy',    label: 'Leve e saudável',    group: 'mood'   },
      { id: 'spicy',            label: 'Apimentado',         group: 'flavor' },
      { id: 'usepantry',        label: 'Usar o que tem',     group: 'mode'   },
      { id: 'quick',            label: '< 20 min',           group: 'time'   },
    ];

    return reply.send(tags);
  });
};

export default aiRoutes;
