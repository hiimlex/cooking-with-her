import { buildApp } from './app';

async function start() {
  const app  = await buildApp();
  const port = parseInt(process.env.PORT ?? '3333');
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen({ port, host });
  console.log(`\n🍳 Cooking With Her API running at http://localhost:${port}\n`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
