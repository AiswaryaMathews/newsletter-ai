const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const logController = require('../controllers/logController');

// Only admins can create logs or view logs
router.post('/', auth(['admin']), logController.createLog);
router.get('/', auth(['admin']), logController.getAllLogs);
router.get('/my-logs', auth(['admin']), logController.getUserLogs);

module.exports = router;
