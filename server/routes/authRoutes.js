const express = require('express');
const router = express.Router();
const { login, signup } = require('../controllers/authController');

router.post('/login', login);
router.post('/signup', signup); // Allow signup only for admin role (handled in controller)

module.exports = router;
