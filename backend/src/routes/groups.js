const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const c = require('../controllers/groupsController');

router.use(authenticate);

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', auditLog('groups'), c.create);
router.put('/:id', auditLog('groups'), c.update);
router.delete('/:id', auditLog('groups'), c.remove);

module.exports = router;
