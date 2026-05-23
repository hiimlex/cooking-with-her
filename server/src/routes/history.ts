import { FastifyPluginAsync } from 'fastify';

const historyRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /history?limit=20&offset=0&byId=
  server.get('/', auth, async (request, reply) => {
    const { limit = '20', offset = '0', personId } = request.query as {
      limit?: string;
      offset?: string;
      personId?: string;
    };

    const userFilter = personId
      ? { by: { personId } }
      : {};

    const [entries, total] = await Promise.all([
      server.prisma.historyEntry.findMany({
        where:   userFilter,
        orderBy: { cookedAt: 'desc' },
        take:    parseInt(limit),
        skip:    parseInt(offset),
        include: {
          recipe: { include: { sprites: true } },
          by:     true,
        },
      }),
      server.prisma.historyEntry.count({ where: userFilter }),
    ]);

    return reply.send({ entries, total });
  });
};

export default historyRoutes;
