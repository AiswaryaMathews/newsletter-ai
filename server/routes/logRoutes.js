const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const logController = require('../controllers/logController');

// Create a new log entry (e.g., on edit, view, or click)
router.post('/', auth(['designer', 'developer']), logController.createLog);

// Get all logs (admin access, or limited to developer/designer)
router.get('/', auth(['developer']), logController.getAllLogs);

// Get logs for the logged-in user
router.get('/my-logs', auth(['designer', 'developer', 'viewer']), logController.getUserLogs);

module.exports = router;
