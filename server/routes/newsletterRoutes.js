const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const controller = require('../controllers/newsletterController');

router.post('/', auth, controller.createNewsletter);
// Add update, delete, getAll, getOne routes

module.exports = router;
