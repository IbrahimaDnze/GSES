const express = require('express');
const Event = require('../models/Event');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { mois, annee } = req.query;
    const filter = {};
    if (mois && annee) {
      const debut = new Date(annee, mois - 1, 1);
      const fin = new Date(annee, mois, 0, 23, 59, 59);
      filter.date = { $gte: debut, $lte: fin };
    }
    const events = await Event.find(filter).sort('date');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
