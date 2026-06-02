const express = require('express');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

const sauvegarderPhoto = (photo, prefix) => {
  if (!photo || !photo.startsWith('data:image')) return photo;
  const matches = photo.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!matches) return photo;
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${prefix}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(__dirname, '..', 'uploads', filename), buffer);
  return filename;
};

router.get('/', protect, async (req, res) => {
  try {
    const { classe, actif, niveau } = req.query;
    const filter = {};
    if (classe) filter.classe = classe;
    if (actif !== undefined) filter.actif = actif === 'true';
    if (niveau) filter.niveauCoranique = niveau;
    const students = await Student.find(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Eleve non trouve' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const data = req.body;
    if (data.photo) data.photo = sauvegarderPhoto(data.photo, 'student');
    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const data = req.body;
    if (data.photo) data.photo = sauvegarderPhoto(data.photo, 'student');
    const student = await Student.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!student) return res.status(404).json({ message: 'Eleve non trouve' });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Eleve non trouve' });
    res.json({ message: 'Eleve supprime' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
