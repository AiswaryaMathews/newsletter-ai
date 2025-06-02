const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const controller = require('../controllers/newsletterController');

// Allow only designers and developers to create newsletters
router.post('/', auth(['designer', 'developer']), controller.createNewsletter);

// Example for a viewer-friendly route (anyone can view)
router.get('/', auth(['viewer', 'designer', 'developer']), controller.getAllNewsletters);

module.exports = router;
