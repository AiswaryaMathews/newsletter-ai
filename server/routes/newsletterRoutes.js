const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const controller = require('../controllers/newsletterController');

// Only admins allowed on all routes
router.post('/', auth(['admin']), controller.createNewsletter);
router.get('/', auth(['admin']), controller.getAllNewsletters);
router.get('/:id', auth(['admin']), controller.getNewsletterById);
router.put('/:id', auth(['admin']), controller.updateNewsletter);
router.delete('/:id', auth(['admin']), controller.deleteNewsletter);

module.exports = router;
