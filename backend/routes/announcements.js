const express = require('express');
const Announcement = require('../models/Announcement');
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
    res.status(201).json(ann);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
