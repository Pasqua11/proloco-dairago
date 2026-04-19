const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getState(req, res, next) {
  try {
    const record = await prisma.appState.findUnique({ where: { id: 1 } });
    res.json(record ? record.data : {});
  } catch (err) { next(err); }
}

async function saveState(req, res, next) {
  try {
    const record = await prisma.appState.upsert({
      where: { id: 1 },
      update: { data: req.body },
      create: { id: 1, data: req.body },
    });
    res.json(record.data);
  } catch (err) { next(err); }
}

module.exports = { getState, saveState };
