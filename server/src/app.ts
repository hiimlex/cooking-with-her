import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

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

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV === 'development'
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : { level: 'warn' },
  });

  await app.register(cors, {
    origin:      process.env.CORS_ORIGIN ?? true,
    credentials: true,
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'cooking-with-her-dev-secret-change-in-prod',
  });

  await app.register(prismaPlugin);
  await app.register(authPlugin);

  await app.register(authRoutes,     { prefix: '/auth'      });
  await app.register(recipesRoutes,  { prefix: '/recipes'   });
  await app.register(pantryRoutes,   { prefix: '/pantry'    });
  await app.register(shoppingRoutes, { prefix: '/shopping'  });
  await app.register(statsRoutes,    { prefix: '/stats'     });
  await app.register(aiRoutes,       { prefix: '/ai'        });
  await app.register(utensilsRoutes, { prefix: '/utensils'  });
  await app.register(memoriesRoutes, { prefix: '/memories'  });
  await app.register(historyRoutes,  { prefix: '/history'   });

  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  return app;
}
