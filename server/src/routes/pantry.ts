import { FastifyPluginAsync } from 'fastify';
import type { PantryQuery, IngredientBody } from '../../../shared/api';

const pantryRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /pantry?cat=&search=&expiringSoon=true&expiryMax=7&sortBy=name&sortOrder=desc
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

    const orderField = sortBy === 'name' ? 'name' : sortBy === 'qty' ? 'qty' : 'expiry';

    const ingredients = await server.prisma.ingredient.findMany({
      where: {
        ...(cat                              && { cat }),
        ...(search                           && { name: { contains: search } }),
        ...(resolvedExpiryMax != null        && { expiry: { lte: resolvedExpiryMax } }),
      },
      orderBy: { [orderField]: sortOrder },
    });

    return reply.send(ingredients);
  });

  // POST /pantry
  server.post('/', auth, async (request, reply) => {
    const body = request.body as IngredientBody;
    const ingredient = await server.prisma.ingredient.create({ data: body });
    return reply.status(201).send(ingredient);
  });

  // PUT /pantry/:id
  server.put('/:id', auth, async (request, reply) => {
    const { id }  = request.params as { id: string };
    const body    = request.body as Partial<IngredientBody>;
    const ingredient = await server.prisma.ingredient.update({ where: { id }, data: body });
    return reply.send(ingredient);
  });

  // DELETE /pantry/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    await server.prisma.ingredient.delete({ where: { id } });
    return reply.status(204).send();
  });
};

export default pantryRoutes;
