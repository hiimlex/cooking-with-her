import { FastifyPluginAsync } from 'fastify';

const pantryRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /pantry?cat=&search=&expiringSoon=true
  server.get('/', auth, async (request, reply) => {
    const { cat, search, expiringSoon } = request.query as {
      cat?: string;
      search?: string;
      expiringSoon?: string;
    };

    const ingredients = await server.prisma.ingredient.findMany({
      where: {
        ...(cat    && { cat }),
        ...(search && { name: { contains: search } }),
        ...(expiringSoon === 'true' && { expiry: { lte: 4 } }),
      },
      orderBy: { expiry: 'asc' },
    });

    return reply.send(ingredients);
  });

  // POST /pantry
  server.post('/', auth, async (request, reply) => {
    const body = request.body as {
      name: string;
      qty: number;
      unit: string;
      cat: string;
      sprite: string;
      expiry: number;
    };

    const ingredient = await server.prisma.ingredient.create({ data: body });
    return reply.status(201).send(ingredient);
  });

  // PUT /pantry/:id
  server.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      name: string;
      qty: number;
      unit: string;
      cat: string;
      sprite: string;
      expiry: number;
    }>;

    const ingredient = await server.prisma.ingredient.update({
      where: { id },
      data:  body,
    });

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
