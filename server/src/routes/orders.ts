import { FastifyPluginAsync } from 'fastify';

const ordersRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  async function getCoupleId(userId: string): Promise<string | null> {
    const user = await server.prisma.user.findUnique({
      where:  { id: userId },
      select: { coupleId: true },
    });
    return user?.coupleId ?? null;
  }

  // GET /orders?from=2026-01-01&to=2026-12-31
  server.get('/', auth, async (request, reply) => {
    const { userId } = request.user;
    const coupleId = await getCoupleId(userId);
    if (!coupleId) return reply.status(401).send({ error: 'Usuário não encontrado' });

    const { from, to } = request.query as { from?: string; to?: string };

    const where: Record<string, unknown> = { coupleId };
    if (from || to) {
      where.date = {
        ...(from ? { gte: from } : {}),
        ...(to   ? { lte: to   } : {}),
      };
    }

    const entries = await server.prisma.orderEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return reply.send(entries);
  });

  // POST /orders  { date: string; note?: string }
  server.post('/', auth, async (request, reply) => {
    const { userId } = request.user;
    const coupleId = await getCoupleId(userId);
    if (!coupleId) return reply.status(401).send({ error: 'Usuário não encontrado' });

    const { date, note } = request.body as { date: string; note?: string };

    if (!date) {
      return reply.status(400).send({ error: 'date é obrigatório' });
    }

    const entry = await server.prisma.orderEntry.create({
      data: { date, note, coupleId },
    });

    return reply.status(201).send(entry);
  });

  // DELETE /orders/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { userId } = request.user;
    const coupleId = await getCoupleId(userId);
    if (!coupleId) return reply.status(401).send({ error: 'Usuário não encontrado' });

    const { id } = request.params as { id: string };

    const entry = await server.prisma.orderEntry.findUnique({ where: { id } });
    if (!entry || entry.coupleId !== coupleId) {
      return reply.status(404).send({ error: 'Não encontrado' });
    }

    await server.prisma.orderEntry.delete({ where: { id } });
    return reply.status(204).send();
  });
};

export default ordersRoutes;
