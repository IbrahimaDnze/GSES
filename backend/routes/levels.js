const express = require('express');
const Level = require('../models/Level');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const levels = await Level.find().sort('nom');
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ message: 'Nom requis' });
    const existing = await Level.findOne({ nom });
    if (existing) return res.status(400).json({ message: 'Niveau deja existant' });
    const level = await Level.create({ nom });
    res.status(201).json(level);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;