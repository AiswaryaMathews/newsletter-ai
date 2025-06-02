const Log = require('../models/Log');

exports.createLog = async (req, res) => {
  try {
    const log = new Log({ ...req.body, user: req.user.id });
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create log', error });
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find().populate('user', 'email role');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error });
  }
};

exports.getUserLogs = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your logs', error });
  }
};
