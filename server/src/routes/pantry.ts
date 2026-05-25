import { FastifyPluginAsync } from 'fastify';
import type { PantryQuery, IngredientBody } from '../../../shared/api';

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Returns the multiplicative factor to convert quantities from `fromUnit` to
 * `toUnit`, or `null` when no automatic conversion is possible (same unit,
 * incompatible families, or non-numeric units like "unid").
 *
 * Examples:
 *   g  → kg  = 0.001
 *   kg → g   = 1000
 *   ml → L   = 0.001
 *   L  → ml  = 1000
 */
function conversionFactor(fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return null;
  const table: Record<string, Record<string, number>> = {
    g:  { kg: 0.001 },
    kg: { g: 1000   },
    ml: { L: 0.001  },
    L:  { ml: 1000  },
  };
  return table[fromUnit]?.[toUnit] ?? null;
}

const pantryRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /pantry
  server.get('/', auth, async (request, reply) => {
    const {
      cat,
      search,
      expiringSoon,
      expiryMax,
      sortBy    = 'expiry',
      sortOrder = 'asc',
    } = request.query as PantryQuery;

    const resolvedExpiryMax =
      expiryMax != null
        ? parseInt(expiryMax)
        : expiringSoon === 'true'
        ? 4
        : undefined;

    const where: Record<string, unknown> = {};
    if (cat) where.cat = cat;
    if (resolvedExpiryMax != null) where.expiry = { lte: resolvedExpiryMax };

    const orderField = sortBy === 'name' ? 'name' : sortBy === 'qty' ? 'qty' : 'expiry';
    const order      = sortOrder === 'desc' ? 'desc' : 'asc';

    let rows = await server.prisma.ingredient.findMany({
      where,
      orderBy: { [orderField]: order },
    });

    if (search && search.trim().length > 0) {
      const norm = normalizeForSearch(search.trim());
      rows = rows.filter((i) => normalizeForSearch(i.name).includes(norm)).slice(0, 12);
    }

    return reply.send(rows);
  });

  // POST /pantry
  server.post('/', auth, async (request, reply) => {
    const body = request.body as IngredientBody;

    const id = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48)
      + '-' + Date.now().toString(36);

    const ingredient = await server.prisma.ingredient.create({
      data: {
        id,
        name:            body.name,
        qty:             body.qty ?? 0,
        unit:            body.unit,
        cat:             body.cat,
        expiry:          body.expiry,
        monthlyBuy:      body.monthlyBuy ?? null,
        alwaysAvailable: body.alwaysAvailable ?? false,
      },
    });

    return reply.status(201).send(ingredient);
  });

  // PUT /pantry/:id
  server.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body   = request.body as Partial<IngredientBody>;

    const data: Record<string, unknown> = {};
    if (body.name            !== undefined) data.name            = body.name;
    if (body.qty             !== undefined) data.qty             = body.qty;
    if (body.unit            !== undefined) data.unit            = body.unit;
    if (body.cat             !== undefined) data.cat             = body.cat;
    if (body.expiry          !== undefined) data.expiry          = body.expiry;
    if (body.monthlyBuy      !== undefined) data.monthlyBuy      = body.monthlyBuy ?? null;
    if (body.alwaysAvailable !== undefined) data.alwaysAvailable = body.alwaysAvailable;

    // Fetch current ingredient — needed to detect unit change and to 404-check early
    const current = await server.prisma.ingredient.findUnique({ where: { id } });
    if (!current) return reply.status(404).send({ error: 'Ingrediente não encontrado' });

    if (Object.keys(data).length === 0) return reply.send(current);

    const newUnit = typeof body.unit === 'string' ? body.unit : null;
    const factor  = newUnit ? conversionFactor(current.unit, newUnit) : null;

    try {
      const ingredient = await server.prisma.$transaction(async (tx) => {
        const updated = await tx.ingredient.update({ where: { id }, data });

        if (factor !== null && newUnit) {
          // Cascade: only convert RecipeIngredients that are still in the old
          // unit. This avoids double-converting recipes that already store the
          // ingredient in a different unit (e.g. xícara instead of g).
          // We do the multiplication in JavaScript to avoid raw-SQL type
          // coercion issues (DOUBLE PRECISION * parameterized float can
          // misbehave in some Prisma/PgBouncer setups).
          const affected = await tx.recipeIngredient.findMany({
            where: { ingredientId: id, unit: current.unit },
            select: { id: true, qty: true },
          });

          for (const ri of affected) {
            const converted = Math.round(ri.qty * factor * 1e9) / 1e9;
            await tx.recipeIngredient.update({
              where: { id: ri.id },
              data:  { qty: converted, unit: newUnit },
            });
          }
        }

        return updated;
      });

      return reply.send(ingredient);
    } catch {
      return reply.status(404).send({ error: 'Ingrediente não encontrado' });
    }
  });

  // DELETE /pantry/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await server.prisma.ingredient.delete({ where: { id } });
    } catch {
      return reply.status(404).send({ error: 'Ingrediente não encontrado' });
    }
    return reply.status(204).send();
  });
};

export default pantryRoutes;
