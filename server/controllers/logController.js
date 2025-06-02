const AuditLog = require('../models/AuditLog');

const isAdmin = (req) => req.user.role === 'admin';

exports.createLog = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const log = await AuditLog.create({ ...req.body, userId: req.user.id });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create log', error: error.message });
  }
};

exports.getAllLogs = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const logs = await AuditLog.find();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
};

exports.getUserLogs = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const logs = await AuditLog.find({ userId: req.user.id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user logs', error: error.message });
  }
};
