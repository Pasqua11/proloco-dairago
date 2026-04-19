const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.available === 'true') where.isAvailable = true;
    const items = await prisma.menuItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, description, category, price, sortOrder } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'name e category obbligatori' });
    }
    const item = await prisma.menuItem.create({
      data: { name, description, category, price: price ? parseFloat(price) : null, sortOrder: sortOrder || 0 },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { name, description, category, price, isAvailable, sortOrder } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (price !== undefined) data.price = price ? parseFloat(price) : null;
    if (isAvailable !== undefined) data.isAvailable = isAvailable;
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
    const item = await prisma.menuItem.update({ where: { id: parseInt(req.params.id) }, data });
    res.json(item);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.menuItem.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
