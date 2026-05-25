#!/bin/sh
set -e

echo "🗄️  Syncing database schema..."
npx prisma db push --skip-generate

if [ "${SEED_DB}" = "true" ]; then
  echo "🌱 Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "🍳 Starting Cooking With Her API..."
exec npx tsx src/index.ts
