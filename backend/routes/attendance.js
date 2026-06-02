const express = require('express');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { date, type, eleve, enseignant, mois, annee } = req.query;
    const filter = {};
    if (date) filter.date = new Date(date);
    if (type) filter.type = type;
    if (eleve) filter.eleve = eleve;
    if (enseignant) filter.enseignant = enseignant;
    if (mois && annee) {
      const debut = new Date(annee, mois - 1, 1);
      const fin = new Date(annee, mois, 0);
      filter.date = { $gte: debut, $lte: fin };
    }
    const attendances = await Attendance.find(filter)
      .populate('eleve', 'nom prenom')
      .populate('enseignant', 'nom prenom');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { type, date, statut, eleveId, enseignantId, justification } = req.body;
    const data = {
      type,
      date: new Date(date),
      statut,
      justification,
      enregistrePar: req.user._id
    };
    if (type === 'eleve') data.eleve = eleveId;
    else data.enseignant = enseignantId;

    const existing = await Attendance.findOne(
      type === 'eleve' ? { date: data.date, eleve: data.eleve } : { date: data.date, enseignant: data.enseignant }
    );
    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      return res.json(existing);
    }
    const attendance = await Attendance.create(data);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/rapport-mensuel', protect, async (req, res) => {
  try {
    const { mois, annee, type } = req.query;
    const debut = new Date(annee, mois - 1, 1);
    const fin = new Date(annee, mois, 0);
    const filter = { date: { $gte: debut, $lte: fin } };
    if (type) filter.type = type;
    const attendances = await Attendance.find(filter)
      .populate('eleve', 'nom prenom')
      .populate('enseignant', 'nom prenom');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
