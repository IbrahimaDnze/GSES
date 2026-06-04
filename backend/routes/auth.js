const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { nom, email, motDePasse, role, telephone } = req.body;
    if (!nom || !email || !motDePasse) return res.status(400).json({ message: 'Nom, email et mot de passe requis' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email deja utilise' });
    const user = await User.create({ nom, email, motDePasse, role, telephone });
    res.status(201).json({ id: user._id, nom: user.nom, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function ajouterClassesEnseignant(userObj) {
  if (userObj.role === 'enseignant') {
    const teacher = await Teacher.findOne({
      $or: [
        { email: userObj.email },
        { nom: userObj.nom },
      ]
    }).select('classes');
    if (teacher) {
      userObj = { ...(userObj.toObject ? userObj.toObject() : userObj), classes: teacher.classes || [] };
    }
  }
  return userObj;
}

router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    if (!user.actif) return res.status(401).json({ message: 'Compte desactive' });
    const isMatch = await user.comparerMotDePasse(motDePasse);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    let userData = { id: user._id, nom: user.nom, email: user.email, role: user.role, photo: user.photo, telephone: user.telephone };
    userData = await ajouterClassesEnseignant(userData);
    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  let userData = req.user;
  if (userData.role === 'enseignant') {
    userData = await ajouterClassesEnseignant(userData);
  }
  res.json(userData);
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse, photo } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouve' });
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email deja utilise' });
    }
    if (nom !== undefined) user.nom = nom;
    if (email !== undefined) user.email = email;
    if (telephone !== undefined) user.telephone = telephone;
    if (motDePasse) user.motDePasse = motDePasse;

    if (photo && photo.startsWith('data:')) {
      const result = await uploadImage(photo, 'photos');
      if (result) user.photo = result;
    }

    await user.save();
    res.json({
      id: user._id, nom: user.nom, email: user.email,
      role: user.role, telephone: user.telephone, photo: user.photo
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email' });
    const code = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordToken = code;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    console.log(`[PasswordReset] Code pour ${email} : ${code}`);
    res.json({ message: 'Code de réinitialisation envoyé', code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, motDePasse } = req.body;
    if (!email || !code || !motDePasse) return res.status(400).json({ message: 'Email, code et nouveau mot de passe requis' });
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Code invalide ou expiré' });
    user.motDePasse = motDePasse;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    console.log(`[PasswordReset] Mot de passe réinitialisé pour ${email}`);
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
