const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: String,
  content: String,
  summary: String,
  tone: String,
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
