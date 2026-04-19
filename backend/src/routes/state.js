const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getState, saveState } = require('../controllers/stateController');

router.get('/', authenticate, getState);
router.put('/', authenticate, saveState);

module.exports = router;
