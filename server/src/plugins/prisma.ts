import { PrismaClient } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

function buildDatabaseUrl(base: string): string {
  try {
    const url = new URL(base);
    if (!url.searchParams.has("connection_limit"))
      url.searchParams.set("connection_limit", "3");
    if (!url.searchParams.has("pool_timeout"))
      url.searchParams.set("pool_timeout", "30");
    return url.toString();
  } catch {
    return base;
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (server) => {
  const dbUrl = process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
    datasources: dbUrl ? { db: { url: buildDatabaseUrl(dbUrl) } } : undefined,
  });

  await prisma.$connect();

  server.decorate("prisma", prisma);

  server.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });
});

export default prismaPlugin;
