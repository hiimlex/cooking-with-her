import { FastifyPluginAsync } from 'fastify';

const authRoutes: FastifyPluginAsync = async (server) => {
  // POST /auth/login
  // Body: { code: string; who: 'alex' | 'yuka' }
  server.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['code', 'who'],
        properties: {
          code: { type: 'string' },
          who:  { type: 'string', enum: ['alex', 'yuka'] },
        },
      },
    },
  }, async (request, reply) => {
    const { code, who } = request.body as { code: string; who: 'alex' | 'yuka' };

    const couple = await server.prisma.couple.findUnique({ where: { code } });

    if (!couple) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Palavra incorreta.' });
    }

    const user = await server.prisma.user.findUnique({
      where: { personId: who },
      include: { couple: true },
    });

    if (!user || user.coupleId !== couple.id) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'User not found in couple' });
    }

    const token = server.jwt.sign(
      { userId: user.id, personId: user.personId, coupleId: couple.id },
      { expiresIn: '30d' },
    );

    return reply.send({
      token,
      user: {
        id: user.id,
        personId: user.personId,
        name: user.name,
        color: user.color,
      },
      couple: {
        id: couple.id,
        startedDate: couple.startedDate,
        weekGoal: couple.weekGoal,
      },
    });
  });

  // GET /auth/me — verify token and return current user
  server.get('/me', {
    preHandler: [server.authenticate],
  }, async (request, reply) => {
    const { userId } = request.user;

    const user = await server.prisma.user.findUnique({
      where: { id: userId },
      include: { couple: true },
    });

    if (!user) return reply.status(404).send({ error: 'User not found' });

    return reply.send({
      user: {
        id: user.id,
        personId: user.personId,
        name: user.name,
        color: user.color,
      },
      couple: {
        id: user.couple.id,
        startedDate: user.couple.startedDate,
        weekGoal: user.couple.weekGoal,
      },
    });
  });
};

export default authRoutes;
