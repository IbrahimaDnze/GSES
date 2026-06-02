const express = require('express');
const Subject = require('../models/Subject');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find().sort('nom');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ message: 'Nom requis' });
    const existing = await Subject.findOne({ nom });
    if (existing) return res.status(400).json({ message: 'Matiere deja existante' });
    const subject = await Subject.create({ nom });
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;