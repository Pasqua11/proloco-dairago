const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function auditLog(tableName) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      const method = req.method;
      const action = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' }[method];
      if (action) {
        prisma.auditLog.create({
          data: {
            userId: req.user?.id ?? null,
            action,
            tableName,
            recordId: data?.id ?? req.params?.id ? parseInt(req.params.id) : null,
            newValues: ['CREATE', 'UPDATE'].includes(action) ? data : null,
            ipAddress: req.ip,
          },
        }).catch(() => {});
      }
      return originalJson(data);
    };
    next();
  };
}

module.exports = { auditLog };
