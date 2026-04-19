const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const where = req.query.groupId ? { groupId: parseInt(req.query.groupId) } : {};
    const assignments = await prisma.assignment.findMany({
      where,
      include: { group: { include: { session: { include: { date: true } } } } },
      orderBy: [{ tableNumber: 'asc' }],
    });
    res.json(assignments);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { groupId, tableNumber, seats, notes } = req.body;
    if (!groupId || !tableNumber || !seats) {
      return res.status(400).json({ error: 'groupId, tableNumber e seats obbligatori' });
    }
    const assignment = await prisma.assignment.create({
      data: {
        groupId: parseInt(groupId),
        tableNumber: parseInt(tableNumber),
        seats: parseInt(seats),
        notes,
      },
      include: { group: true },
    });
    res.status(201).json(assignment);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { tableNumber, seats, notes } = req.body;
    const data = {};
    if (tableNumber !== undefined) data.tableNumber = parseInt(tableNumber);
    if (seats !== undefined) data.seats = parseInt(seats);
    if (notes !== undefined) data.notes = notes;
    const assignment = await prisma.assignment.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(assignment);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.assignment.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
