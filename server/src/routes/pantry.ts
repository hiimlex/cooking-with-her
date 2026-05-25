import { FastifyPluginAsync } from 'fastify';
import type { PantryQuery, IngredientBody } from '../../../shared/api';

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Raw row shape returned by SQLite
interface RawIngredient {
  id:               string;
  name:             string;
  qty:              number;
  unit:             string;
  cat:              string;
  expiry:           number;
  monthlyBuy:       number | null;
  alwaysAvailable:  number; // SQLite stores booleans as 0/1
}

function toIngredient(row: RawIngredient) {
  return {
    id:               row.id,
    name:             row.name,
    qty:              row.qty,
    unit:             row.unit,
    cat:              row.cat,
    expiry:           row.expiry,
    monthlyBuy:       row.monthlyBuy ?? undefined,
    alwaysAvailable:  Boolean(row.alwaysAvailable),
  };
}

const pantryRoutes: FastifyPluginAsync = async (server) => {
  const auth = { preHandler: [server.authenticate] };

  // GET /pantry
  server.get('/', auth, async (request, reply) => {
    const {
      cat,
      search,
      expiringSoon,
      expiryMax,
      sortBy    = 'expiry',
      sortOrder = 'asc',
    } = request.query as PantryQuery;

    const resolvedExpiryMax =
      expiryMax != null
        ? parseInt(expiryMax)
        : expiringSoon === 'true'
        ? 4
        : undefined;

    const orderField = sortBy === 'name' ? 'name' : sortBy === 'qty' ? 'qty' : 'expiry';
    const order      = sortOrder === 'desc' ? 'DESC' : 'ASC';

    // Fetch all rows (with optional cat/expiry filter) then filter in JS for accent-insensitive search
    let whereParts: string[] = [];
    let params: any[]        = [];

    if (cat) {
      whereParts.push('cat = ?');
      params.push(cat);
    }
    if (resolvedExpiryMax != null) {
      whereParts.push('expiry <= ?');
      params.push(resolvedExpiryMax);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
    const sql = `SELECT id, name, qty, unit, cat, expiry, monthlyBuy, alwaysAvailable
                 FROM Ingredient ${whereClause}
                 ORDER BY ${orderField} ${order}`;

    const rows = await server.prisma.$queryRawUnsafe<RawIngredient[]>(sql, ...params);
    let result = rows.map(toIngredient);

    if (search && search.trim().length > 0) {
      const norm = normalizeForSearch(search.trim());
      result = result.filter((i) => normalizeForSearch(i.name).includes(norm)).slice(0, 12);
    }

    return reply.send(result);
  });

  // POST /pantry
  server.post('/', auth, async (request, reply) => {
    const body = request.body as IngredientBody;

    // Generate a slug-like id from the name
    const id = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48)
      + '-' + Date.now().toString(36);

    await server.prisma.$executeRawUnsafe(
      `INSERT INTO Ingredient (id, name, qty, unit, cat, expiry, monthlyBuy, alwaysAvailable)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      body.name,
      body.qty ?? 0,
      body.unit,
      body.cat,
      body.expiry,
      body.monthlyBuy ?? null,
      body.alwaysAvailable ? 1 : 0,
    );

    const rows = await server.prisma.$queryRawUnsafe<RawIngredient[]>(
      `SELECT id, name, qty, unit, cat, expiry, monthlyBuy, alwaysAvailable FROM Ingredient WHERE id = ?`,
      id,
    );
    return reply.status(201).send(toIngredient(rows[0]));
  });

  // PUT /pantry/:id
  server.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body   = request.body as Partial<IngredientBody>;

    const setParts: string[] = [];
    const params: any[]      = [];

    if (body.name             !== undefined) { setParts.push('name = ?');             params.push(body.name); }
    if (body.qty              !== undefined) { setParts.push('qty = ?');              params.push(body.qty); }
    if (body.unit             !== undefined) { setParts.push('unit = ?');             params.push(body.unit); }
    if (body.cat              !== undefined) { setParts.push('cat = ?');              params.push(body.cat); }
    if (body.expiry           !== undefined) { setParts.push('expiry = ?');           params.push(body.expiry); }
    if (body.monthlyBuy       !== undefined) { setParts.push('monthlyBuy = ?');       params.push(body.monthlyBuy ?? null); }
    if (body.alwaysAvailable  !== undefined) { setParts.push('alwaysAvailable = ?');  params.push(body.alwaysAvailable ? 1 : 0); }

    if (setParts.length > 0) {
      params.push(id);
      await server.prisma.$executeRawUnsafe(
        `UPDATE Ingredient SET ${setParts.join(', ')} WHERE id = ?`,
        ...params,
      );
    }

    const rows = await server.prisma.$queryRawUnsafe<RawIngredient[]>(
      `SELECT id, name, qty, unit, cat, expiry, monthlyBuy, alwaysAvailable FROM Ingredient WHERE id = ?`,
      id,
    );
    if (!rows[0]) return reply.status(404).send({ error: 'Ingrediente não encontrado' });
    return reply.send(toIngredient(rows[0]));
  });

  // DELETE /pantry/:id
  server.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string };
    await server.prisma.ingredient.delete({ where: { id } });
    return reply.status(204).send();
  });
};

export default pantryRoutes;
