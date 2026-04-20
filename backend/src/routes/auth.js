const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { login, me, changePassword, verifyPin } = require('../controllers/authController');

router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/change-password', authenticate, changePassword);
router.post('/verify-pin', authenticate, verifyPin);

module.exports = router;
