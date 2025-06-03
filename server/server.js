const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');        // add bcrypt
const User = require('./models/User');     // add User model
require('dotenv').config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Test route to verify password matching
app.post('/test-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    res.json({ passwordMatches: isMatch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MongoDB connected and server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
