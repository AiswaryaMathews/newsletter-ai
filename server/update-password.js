// update-password.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // adjust the path if needed
require('dotenv').config();

async function updatePassword(email, newPlainPassword) {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

  const user = await User.findOneAndUpdate(
    { email },
    { password: hashedPassword },
    { new: true }
  );

  if (user) {
    console.log(`Password updated for ${email}`);
  } else {
    console.log(`User not found: ${email}`);
  }

  mongoose.disconnect();
}

// Replace with your admin email and password
updatePassword('johndoe1@gmail.com', 'admin123');
