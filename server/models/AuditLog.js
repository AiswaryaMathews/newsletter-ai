const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: String,
  newsletterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Newsletter' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', logSchema);
