const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const where = req.query.sessionId ? { sessionId: parseInt(req.query.sessionId) } : {};
    const groups = await prisma.group.findMany({
      where,
      include: { session: { include: { date: true } }, assignments: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(groups);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { session: { include: { date: true } }, assignments: true },
    });
    if (!group) return res.status(404).json({ error: 'Gruppo non trovato' });
    res.json(group);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { sessionId, name, size, notes, contactName, contactPhone } = req.body;
    if (!sessionId || !name || !size) {
      return res.status(400).json({ error: 'sessionId, name e size obbligatori' });
    }
    const group = await prisma.group.create({
      data: {
        sessionId: parseInt(sessionId),
        name,
        size: parseInt(size),
        notes,
        contactName,
        contactPhone,
      },
      include: { assignments: true },
    });
    res.status(201).json(group);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { name, size, notes, contactName, contactPhone } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (size !== undefined) data.size = parseInt(size);
    if (notes !== undefined) data.notes = notes;
    if (contactName !== undefined) data.contactName = contactName;
    if (contactPhone !== undefined) data.contactPhone = contactPhone;
    const group = await prisma.group.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { assignments: true },
    });
    res.json(group);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    if (req.user?.role === 'prenotazioni') {
      return res.status(403).json({ error: 'Non hai il permesso di cancellare prenotazioni' });
    }
    await prisma.group.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove };
