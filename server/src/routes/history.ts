import { FastifyPluginAsync } from 'fastify';

const historyRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /history/latest — entrada mais recente, shape mínimo para a home
  server.get('/latest', auth, async (request, reply) => {
    const { userId } = request.user;

    const user = await server.prisma.user.findUnique({
      where:  { id: userId },
      select: { coupleId: true },
    });
    if (!user) return reply.status(401).send({ error: 'Sessão expirada.' });

    const users = await server.prisma.user.findMany({
      where:  { coupleId: user.coupleId },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    const entry = await server.prisma.historyEntry.findFirst({
      where:   { byId: { in: userIds } },
      orderBy: { cookedAt: 'desc' },
      select: {
        id:       true,
        cookedAt: true,
        rating:   true,
        mealType: true,
        recipe: {
          select: {
            id:      true,
            name:    true,
            sprites: { select: { sprite: true }, take: 1 },
          },
        },
        by: { select: { personId: true, name: true } },
      },
    });

    return reply.send(entry ?? null);
  });

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
