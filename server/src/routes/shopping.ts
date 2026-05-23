import { FastifyPluginAsync } from 'fastify';

const shoppingRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /shopping
  server.get('/', auth, async (request, reply) => {
    const [items, suggestions] = await Promise.all([
      server.prisma.shoppingEntry.findMany({
        orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
        include: { by: true },
      }),
      buildSuggestions(server.prisma),
    ]);

    return reply.send({ items, suggestions });
  });

  // POST /shopping
  server.post('/', auth, async (request, reply) => {
    const { userId } = request.user;
    const body = request.body as {
      name: string;
      qty: string;
      cat: string;
      ingredientId?: string;
    };

    const item = await server.prisma.shoppingEntry.create({
      data: { ...body, byId: userId },
      include: { by: true },
    });

    return reply.status(201).send(item);
  });

  // PATCH /shopping/:id/toggle
  server.patch('/:id/toggle', auth, async (request, reply) => {
    const { id } = request.params as { id: string };

    const current = await server.prisma.shoppingEntry.findUnique({ where: { id } });
    if (!current) return reply.status(404).send({ error: 'Item not found' });

    const item = await server.prisma.shoppingEntry.update({
      where: { id },
      data:  { done: !current.done },
    });

    return reply.send(item);
  });

  // DELETE /shopping/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    await server.prisma.shoppingEntry.delete({ where: { id } });
    return reply.status(204).send();
  });

  // DELETE /shopping/done — clear all done items
  server.delete('/done', auth, async (request, reply) => {
    const { count } = await server.prisma.shoppingEntry.deleteMany({
      where: { done: true },
    });
    return reply.send({ deleted: count });
  });
};

// Build AI-style shopping suggestions from pantry data
async function buildSuggestions(prisma: any) {
  const expiring = await prisma.ingredient.findMany({
    where:   { expiry: { lte: 4 } },
    take:    4,
    orderBy: { expiry: 'asc' },
  });

  return expiring.map((ing: any) => ({
    id:     ing.id,
    name:   ing.name,
    reason: ing.expiry <= 1
      ? `Expires today — use it up!`
      : `Expires in ${ing.expiry} days`,
  }));
}

export default shoppingRoutes;
