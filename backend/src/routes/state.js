const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getState, getVersion, saveState } = require('../controllers/stateController');

router.get('/version', authenticate, getVersion);
router.get('/', authenticate, getState);
router.put('/', authenticate, saveState);

module.exports = router;
