const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { list } = require('../controllers/auditController');

router.get('/', authenticate, requireRole('admin'), list);

module.exports = router;
