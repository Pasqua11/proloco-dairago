const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const c = require('../controllers/sessionsController');

router.use(authenticate);

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', requireRole('admin'), auditLog('sessions'), c.create);
router.put('/:id', requireRole('admin'), auditLog('sessions'), c.update);
router.delete('/:id', requireRole('admin'), auditLog('sessions'), c.remove);

module.exports = router;
