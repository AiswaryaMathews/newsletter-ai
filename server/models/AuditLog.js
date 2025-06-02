const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g., "created", "edited", "deleted"
  targetType: { type: String, required: true }, // e.g., "Newsletter"
  targetId: { type: mongoose.Schema.Types.ObjectId },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
