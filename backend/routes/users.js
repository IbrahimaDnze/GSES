const express = require('express');
const User = require('../models/User');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-motDePasse');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const { nom, email, motDePasse, role, telephone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email deja utilise' });
    const user = await User.create({ nom, email, motDePasse, role, telephone });
    res.status(201).json({ id: user._id, nom: user.nom, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const { nom, email, role, actif, telephone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { nom, email, role, actif, telephone }, { new: true }
    ).select('-motDePasse');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouve' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouve' });
    res.json({ message: 'Utilisateur supprime' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
