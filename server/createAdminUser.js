// createAdminUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User'); // adjust path if different

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await User.findOne({ email: 'johndoe1@gmail.com' });
    if (existing) {
      console.log('User already exists');
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const newUser = new User({
      email: 'johndoe1@gmail.com',
      password: hashedPassword,
      role: 'admin', // only 'admin' allowed in your setup
    });

    await newUser.save();
    console.log('Admin user created: johndoe1@gmail.com with password: admin123');

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
};

createAdmin();
