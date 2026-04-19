const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const where = req.query.dateId ? { dateId: parseInt(req.query.dateId) } : {};
    const sessions = await prisma.session.findMany({
      where,
      include: { date: true, _count: { select: { groups: true } } },
      orderBy: [{ dateId: 'asc' }, { startTime: 'asc' }],
    });
    res.json(sessions);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        date: true,
        groups: { include: { assignments: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!session) return res.status(404).json({ error: 'Sessione non trovata' });
    res.json(session);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { dateId, name, startTime, endTime, maxCapacity } = req.body;
    if (!dateId || !name || !startTime) {
      return res.status(400).json({ error: 'dateId, name e startTime obbligatori' });
    }
    const session = await prisma.session.create({
      data: { dateId: parseInt(dateId), name, startTime, endTime, maxCapacity: maxCapacity ? parseInt(maxCapacity) : null },
    });
    res.status(201).json(session);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { name, startTime, endTime, maxCapacity, isActive } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (startTime !== undefined) data.startTime = startTime;
    if (endTime !== undefined) data.endTime = endTime;
    if (maxCapacity !== undefined) data.maxCapacity = maxCapacity ? parseInt(maxCapacity) : null;
    if (isActive !== undefined) data.isActive = isActive;
    const session = await prisma.session.update({ where: { id: parseInt(req.params.id) }, data });
    res.json(session);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.session.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove };
