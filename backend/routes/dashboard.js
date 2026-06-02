const express = require('express');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', protect, async (req, res) => {
  try {
    const totalEleves = await Student.countDocuments({ actif: true });
    const totalEnseignants = await Teacher.countDocuments({ actif: true });
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourdhui);
    demain.setDate(demain.getDate() + 1);
    const elevesPresentAujourdhui = await Attendance.countDocuments({
      type: 'eleve',
      date: { $gte: aujourdhui, $lt: demain },
      statut: 'present'
    });
    const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
    const finMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0);
    const paiementsMois = await Payment.aggregate([
      { $match: { datePaiement: { $gte: debutMois, $lte: finMois } } },
      { $group: { _id: null, total: { $sum: '$montant' }, nombre: { $sum: 1 } } }
    ]);

    const classesStats = await Student.aggregate([
      { $match: { actif: true } },
      { $group: { _id: '$niveauCoranique', count: { $sum: 1 } } }
    ]);

    res.json({
      totalEleves,
      totalEnseignants,
      elevesPresentAujourdhui,
      paiementsMois: paiementsMois[0] || { total: 0, nombre: 0 },
      classesStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
