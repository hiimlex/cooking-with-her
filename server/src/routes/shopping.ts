import { FastifyPluginAsync, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';

const sseClients = new Set<FastifyReply>();
const sseTickets = new Map<string, number>(); // ticket → expiry timestamp

function broadcast(data: object) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.raw.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function buildSnapshot(prisma: any) {
  const [items, suggestions] = await Promise.all([
    prisma.shoppingEntry.findMany({
      orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
      include: { by: true },
    }),
    buildSuggestions(prisma),
  ]);
  return { type: 'update', items, suggestions };
}

const shoppingRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // POST /shopping/events/ticket — exchange JWT for a single-use SSE ticket
  server.post('/events/ticket', auth, async (_request, reply) => {
    const ticket = randomUUID();
    sseTickets.set(ticket, Date.now() + 30_000);
    return reply.send({ ticket });
  });

  // GET /shopping/events — SSE (auth via one-time ticket)
  server.get('/events', async (request, reply) => {
    const { ticket } = request.query as { ticket?: string };
    if (!ticket) return reply.status(401).send({ error: 'Unauthorized' });

    const expires = sseTickets.get(ticket);
    if (!expires || Date.now() > expires) {
      sseTickets.delete(ticket);
      return reply.status(401).send({ error: 'Invalid or expired ticket' });
    }
    sseTickets.delete(ticket);

    const origin = (request.headers.origin as string) ?? 'http://localhost:5173';
    reply.raw.setHeader('Access-Control-Allow-Origin',      origin);
    reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
    reply.raw.setHeader('Content-Type',      'text/event-stream');
    reply.raw.setHeader('Cache-Control',     'no-cache');
    reply.raw.setHeader('Connection',        'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.raw.flushHeaders();

    sseClients.add(reply);

    const snapshot = await buildSnapshot(server.prisma);
    reply.raw.write(`data: ${JSON.stringify(snapshot)}\n\n`);

    const ping = setInterval(() => {
      try   { reply.raw.write(': ping\n\n'); }
      catch { clearInterval(ping); sseClients.delete(reply); }
    }, 25_000);

    await new Promise<void>((resolve) => {
      request.raw.on('close', () => {
        clearInterval(ping);
        sseClients.delete(reply);
        resolve();
      });
    });
  });

  server.get('/', auth, async (_request, reply) => {
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
    const body = request.body as { name: string; qty: string; cat: string; ingredientId?: string };

    const item = await server.prisma.shoppingEntry.create({
      data: { ...body, byId: userId },
      include: { by: true },
    });

    broadcast(await buildSnapshot(server.prisma));
    return reply.status(201).send(item);
  });

  // DELETE /shopping/done — must be before /:id to avoid param capture
  server.delete('/done', auth, async (_request, reply) => {
    const { count } = await server.prisma.shoppingEntry.deleteMany({ where: { done: true } });
    broadcast(await buildSnapshot(server.prisma));
    return reply.send({ deleted: count });
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

    broadcast(await buildSnapshot(server.prisma));
    return reply.send(item);
  });

  // DELETE /shopping/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    await server.prisma.shoppingEntry.delete({ where: { id } });
    broadcast(await buildSnapshot(server.prisma));
    return reply.status(204).send();
  });
};

async function buildSuggestions(prisma: any) {
  const expiring = await prisma.ingredient.findMany({
    where:   { expiry: { lte: 4 } },
    take:    4,
    orderBy: { expiry: 'asc' },
  });
  return expiring.map((ing: any) => ({
    id:     ing.id,
    name:   ing.name,
    reason: ing.expiry <= 1 ? 'Expires today — use it up!' : `Expires in ${ing.expiry} days`,
  }));
}

export default shoppingRoutes;
