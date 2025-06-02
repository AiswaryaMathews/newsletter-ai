const Newsletter = require('../models/Newsletter');
const AuditLog = require('../models/AuditLog');

exports.createNewsletter = async (req, res) => {
  const newsletter = await Newsletter.create({ ...req.body, createdBy: req.user.id });
  await AuditLog.create({ action: 'create', newsletterId: newsletter._id, userId: req.user.id });
  res.status(201).json(newsletter);
};

// Add update, delete, getAll, getOne similarly
