const express = require('express');
const Setting = require('../models/Setting');
const { protect, autoriserRoles } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    const { nomEcole, anneeScolaire, email, langue, devise, logo, signature } = req.body;
    if (nomEcole !== undefined) settings.nomEcole = nomEcole;
    if (anneeScolaire !== undefined) settings.anneeScolaire = anneeScolaire;
    if (email !== undefined) settings.email = email;
    if (langue !== undefined) settings.langue = langue;
    if (devise !== undefined) settings.devise = devise;

    if (logo && logo.startsWith('data:')) {
      const result = await uploadImage(logo, 'logos');
      if (result) settings.logo = result;
    }

    if (signature && signature.startsWith('data:')) {
      const result = await uploadImage(signature, 'signatures');
      if (result) settings.signature = result;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
