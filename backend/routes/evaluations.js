const express = require('express');
const Evaluation = require('../models/Evaluation');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { eleve, niveau } = req.query;
    const filter = {};
    if (req.user.role === 'enseignant') {
      const teacher = await Teacher.findOne({
        $or: [
          { email: req.user.email },
          { nom: req.user.nom },
        ]
      }).select('classes');
      if (teacher && teacher.classes.length > 0) {
        const students = await Student.find({ classe: { $in: teacher.classes } }).select('_id');
        filter.eleve = { $in: students.map(s => s._id) };
      }
    }
    if (eleve) filter.eleve = eleve;
    if (niveau) filter.niveau = niveau;
    const evaluations = await Evaluation.find(filter)
      .populate('eleve', 'nom prenom photo')
      .sort('-dateEvaluation');
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id).populate('eleve');
    if (!evaluation) return res.status(404).json({ message: 'Evaluation non trouvee' });
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, evaluateur: req.user._id };
    const evaluation = await Evaluation.create(data);
    res.status(201).json(evaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!evaluation) return res.status(404).json({ message: 'Evaluation non trouvee' });
    res.json(evaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) return res.status(404).json({ message: 'Evaluation non trouvee' });
    res.json({ message: 'Evaluation supprimee' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
