const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const c = require('../controllers/menuController');

router.get('/', c.list);

router.use(authenticate);
router.post('/', requireRole('admin'), auditLog('menu_items'), c.create);
router.put('/:id', requireRole('admin'), auditLog('menu_items'), c.update);
router.delete('/:id', requireRole('admin'), auditLog('menu_items'), c.remove);

module.exports = router;
