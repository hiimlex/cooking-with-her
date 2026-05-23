import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';

import prismaPlugin from './plugins/prisma';
import authPlugin   from './plugins/auth';

import authRoutes     from './routes/auth';
import recipesRoutes  from './routes/recipes';
import pantryRoutes   from './routes/pantry';
import shoppingRoutes from './routes/shopping';
import statsRoutes    from './routes/stats';
import aiRoutes       from './routes/ai';
import utensilsRoutes from './routes/utensils';
import memoriesRoutes from './routes/memories';
import historyRoutes  from './routes/history';

const server = Fastify({
  logger: {
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

async function bootstrap() {
  // ─── CORS ─────────────────────────────────────────────────────────────────
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  // ─── JWT ──────────────────────────────────────────────────────────────────
  await server.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'cooking-with-her-dev-secret-change-in-prod',
  });

  // ─── Plugins ──────────────────────────────────────────────────────────────
  await server.register(prismaPlugin);
  await server.register(authPlugin);

  // ─── Routes ───────────────────────────────────────────────────────────────
  await server.register(authRoutes,     { prefix: '/auth'      });
  await server.register(recipesRoutes,  { prefix: '/recipes'   });
  await server.register(pantryRoutes,   { prefix: '/pantry'    });
  await server.register(shoppingRoutes, { prefix: '/shopping'  });
  await server.register(statsRoutes,    { prefix: '/stats'     });
  await server.register(aiRoutes,       { prefix: '/ai'        });
  await server.register(utensilsRoutes, { prefix: '/utensils'  });
  await server.register(memoriesRoutes, { prefix: '/memories'  });
  await server.register(historyRoutes,  { prefix: '/history'   });

  // ─── Health check ─────────────────────────────────────────────────────────
  server.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  // ─── Start ────────────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '3333');
  const host = process.env.HOST ?? '0.0.0.0';

  await server.listen({ port, host });
  console.log(`\n🍳 Cooking With Her API running at http://localhost:${port}\n`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
