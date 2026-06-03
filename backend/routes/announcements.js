const express = require('express');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({ actif: true }).sort('-createdAt');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const ann = await Announcement.create(req.body);
    const io = req.app.get('io');

    if (io) {
      io.to('all').emit('new-announcement', ann);

      const users = await User.find({ actif: true }).select('_id');
      const notifications = users.map(u => ({
        destinataire: u._id,
        message: `Nouvelle annonce : ${ann.titre}`,
        type: 'annonce',
        lien: '/annonces',
      }));
      const saved = await Notification.insertMany(notifications);
      saved.forEach(n => {
        io.to(`user:${n.destinataire}`).emit('new-notification', n);
      });
    }

    res.status(201).json(ann);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Annonce introuvable' });
    await Announcement.findByIdAndUpdate(req.params.id, { actif: false });
    await Notification.deleteMany({ message: `Nouvelle annonce : ${ann.titre}` });
    const io = req.app.get('io');
    if (io) {
      io.to('all').emit('delete-announcement', req.params.id);
      io.emit('clear-notifications');
    }
    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
