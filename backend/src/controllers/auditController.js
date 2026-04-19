const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.tableName) where.tableName = req.query.tableName;
    if (req.query.userId) where.userId = parseInt(req.query.userId);

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ data: logs, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

module.exports = { list };
