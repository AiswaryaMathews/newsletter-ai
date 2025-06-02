const Newsletter = require('../models/Newsletter');
const AuditLog = require('../models/AuditLog');

exports.createNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.create(req.body);
    await AuditLog.create({
      user: req.user.id,
      action: 'created',
      targetType: 'Newsletter',
      targetId: newsletter._id,
      details: `Created newsletter titled "${newsletter.title}"`
    });
    res.status(201).json(newsletter);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create newsletter' });
  }
};

exports.updateNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await AuditLog.create({
      user: req.user.id,
      action: 'updated',
      targetType: 'Newsletter',
      targetId: newsletter._id,
      details: `Updated newsletter titled "${newsletter.title}"`
    });
    res.json(newsletter);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update newsletter' });
  }
};

exports.deleteNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
    await AuditLog.create({
      user: req.user.id,
      action: 'deleted',
      targetType: 'Newsletter',
      targetId: newsletter._id,
      details: `Deleted newsletter titled "${newsletter.title}"`
    });
    res.json({ message: 'Newsletter deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete newsletter' });
  }
};

exports.getNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    await AuditLog.create({
      user: req.user.id,
      action: 'viewed',
      targetType: 'Newsletter',
      targetId: newsletter._id,
      details: `Viewed newsletter titled "${newsletter.title}"`
    });
    res.json(newsletter);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get newsletter' });
  }
};
