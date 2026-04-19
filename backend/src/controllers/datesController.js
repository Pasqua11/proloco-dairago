const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const dates = await prisma.date.findMany({
      include: { sessions: { where: { isActive: true }, orderBy: { startTime: 'asc' } } },
      orderBy: { date: 'asc' },
    });
    res.json(dates);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const date = await prisma.date.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        sessions: {
          include: {
            groups: { include: { assignments: true }, orderBy: { createdAt: 'asc' } },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });
    if (!date) return res.status(404).json({ error: 'Data non trovata' });
    res.json(date);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { date, label } = req.body;
    if (!date) return res.status(400).json({ error: 'Data obbligatoria' });
    const record = await prisma.date.create({ data: { date: new Date(date), label } });
    res.status(201).json(record);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { date, label, isActive } = req.body;
    const data = {};
    if (date !== undefined) data.date = new Date(date);
    if (label !== undefined) data.label = label;
    if (isActive !== undefined) data.isActive = isActive;
    const record = await prisma.date.update({ where: { id: parseInt(req.params.id) }, data });
    res.json(record);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.date.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove };
