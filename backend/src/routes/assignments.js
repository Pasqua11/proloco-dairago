const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const c = require('../controllers/assignmentsController');

router.use(authenticate);

router.get('/', c.list);
router.post('/', auditLog('assignments'), c.create);
router.put('/:id', auditLog('assignments'), c.update);
router.delete('/:id', auditLog('assignments'), c.remove);

module.exports = router;
