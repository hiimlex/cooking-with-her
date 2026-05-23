import { FastifyPluginAsync } from 'fastify';

const utensilsRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /utensils
  server.get('/', auth, async (_request, reply) => {
    const utensils = await server.prisma.utensil.findMany({
      orderBy: [{ have: 'desc' }, { name: 'asc' }],
    });
    return reply.send(utensils);
  });

  // PATCH /utensils/:id — toggle have
  server.patch('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { have?: boolean; name?: string; emoji?: string };

    const utensil = await server.prisma.utensil.update({
      where: { id },
      data:  body,
    });

    return reply.send(utensil);
  });

  // POST /utensils — add custom utensil
  server.post('/', auth, async (request, reply) => {
    const body = request.body as { name: string; emoji: string; have?: boolean };

    const utensil = await server.prisma.utensil.create({ data: body });
    return reply.status(201).send(utensil);
  });
};

export default utensilsRoutes;
