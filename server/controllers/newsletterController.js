const Newsletter = require('../models/Newsletter');
const AuditLog = require('../models/AuditLog');

const isAdmin = (req) => req.user.role === 'admin';

exports.createNewsletter = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const newsletter = await Newsletter.create({ ...req.body, createdBy: req.user.id });
    await AuditLog.create({ action: 'create', newsletterId: newsletter._id, userId: req.user.id });
    res.status(201).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create newsletter', error: error.message });
  }
};

exports.getAllNewsletters = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const newsletters = await Newsletter.find();
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch newsletters', error: error.message });
  }
};

exports.getNewsletterById = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch newsletter', error: error.message });
  }
};

exports.updateNewsletter = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const newsletter = await Newsletter.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    await AuditLog.create({ action: 'update', newsletterId: newsletter._id, userId: req.user.id });
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update newsletter', error: error.message });
  }
};

exports.deleteNewsletter = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    await AuditLog.create({ action: 'delete', newsletterId: newsletter._id, userId: req.user.id });
    res.json({ message: 'Newsletter deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete newsletter', error: error.message });
  }
};
