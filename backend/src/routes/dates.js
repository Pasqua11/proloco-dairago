const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const c = require('../controllers/datesController');

router.use(authenticate);

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', requireRole('admin'), auditLog('dates'), c.create);
router.put('/:id', requireRole('admin'), auditLog('dates'), c.update);
router.delete('/:id', requireRole('admin'), auditLog('dates'), c.remove);

module.exports = router;
