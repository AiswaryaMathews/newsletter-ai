const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Existing login route
router.post('/login', login);

// ✅ New test-password route
router.post('/test-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    return res.json({ match });
  } catch (err) {
    return res.status(500).json({ message: 'Error', error: err.message });
  }
}); 

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;
