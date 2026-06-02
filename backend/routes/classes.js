const express = require('express');
const Class = require('../models/Class');
const Student = require('../models/Student');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const classes = await Class.find().populate('enseignant');
    const result = await Promise.all(classes.map(async (c) => {
      const count = await Student.countDocuments({ classe: c.nom, actif: true });
      return { ...c.toObject(), nombreEleves: count };
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('enseignant');
    if (!cls) return res.status(404).json({ message: 'Classe non trouvee' });
    const count = await Student.countDocuments({ classe: cls.nom, actif: true });
    res.json({ ...cls.toObject(), nombreEleves: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const data = req.body;
    if (!data.enseignant) delete data.enseignant;
    const cls = await Class.create(data);
    res.status(201).json(cls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const data = req.body;
    if (!data.enseignant) delete data.enseignant;
    const cls = await Class.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!cls) return res.status(404).json({ message: 'Classe non trouvee' });
    res.json(cls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Classe non trouvee' });
    res.json({ message: 'Classe supprimee' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
