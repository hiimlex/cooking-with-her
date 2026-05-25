import { FastifyPluginAsync } from 'fastify';
import { uploadToCloudinary } from '../services/cloudinary';

const memoriesRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /memories
  server.get('/', auth, async (_request, reply) => {
    const memories = await server.prisma.memory.findMany({
      orderBy: { date: 'desc' },
      include: {
        recipe: { include: { sprites: true } },
        by:     true,
      },
    });
    return reply.send(memories);
  });

  // POST /memories/upload-photo  — multipart, returns { url }
  server.post('/upload-photo', auth, async (request, reply) => {
    const part = await request.file();
    if (!part) {
      return reply.status(400).send({ error: 'No file provided' });
    }

    const buffer   = await part.toBuffer();
    const mimeType = part.mimetype || 'image/jpeg';

    const result = await uploadToCloudinary(buffer, mimeType);
    return reply.send({ url: result.url });
  });

  // POST /memories
  server.post('/', auth, async (request, reply) => {
    const { userId } = request.user;
    const body = request.body as {
      recipeId: string;
      date:     string;
      bg:       string;
      photoUrl?: string;
    };

    const memory = await server.prisma.memory.create({
      data: {
        recipeId: body.recipeId,
        byId:     userId,
        date:     new Date(body.date),
        bg:       body.bg,
        photoUrl: body.photoUrl,
      },
      include: {
        recipe: { include: { sprites: true } },
        by:     true,
      },
    });

    return reply.status(201).send(memory);
  });

  // DELETE /memories/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    await server.prisma.memory.delete({ where: { id } });
    return reply.status(204).send();
  });
};

export default memoriesRoutes;
