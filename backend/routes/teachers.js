const express = require('express');
const fs = require('fs');
const path = require('path');
const Teacher = require('../models/Teacher');
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
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Enseignant non trouve' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const data = req.body;
    if (data.photo) data.photo = sauvegarderPhoto(data.photo, 'teacher');
    const teacher = await Teacher.create(data);
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const data = req.body;
    if (data.photo) data.photo = sauvegarderPhoto(data.photo, 'teacher');
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!teacher) return res.status(404).json({ message: 'Enseignant non trouve' });
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Enseignant non trouve' });
    res.json({ message: 'Enseignant supprime' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
