const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,  // (optional, depending on Mongoose version)
      // useCreateIndex: true       // (optional, depending on Mongoose version)
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error; // let the caller handle the error
  }
};

module.exports = connectDB;
