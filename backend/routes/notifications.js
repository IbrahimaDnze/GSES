const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ destinataire: req.user._id })
      .sort('-createdAt').limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/lu', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, destinataire: req.user._id },
      { lu: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification introuvable' });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/lu-tout', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { destinataire: req.user._id, lu: false },
      { lu: true }
    );
    res.json({ message: 'Tout marqué comme lu' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
