const AuditLog = require('../models/AuditLog');

// Get all logs for a particular newsletter
exports.getLogsForNewsletter = async (req, res) => {
  try {
    const { id } = req.params; // newsletter ID

    const logs = await AuditLog.find({ newsletterId: id }).populate('userId', 'name role');

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};
