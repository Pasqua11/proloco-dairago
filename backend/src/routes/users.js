const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const c = require('../controllers/usersController');

router.use(authenticate, requireRole('admin'));

router.get('/', c.list);
router.post('/', auditLog('users'), c.create);
router.put('/:id', auditLog('users'), c.update);
router.delete('/:id', auditLog('users'), c.remove);

module.exports = router;
