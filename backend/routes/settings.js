const express = require('express');
const fs = require('fs');
const path = require('path');
const Setting = require('../models/Setting');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

router.get('/', protect, async (req, res) => {
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
      const matches = logo.match(/^data:image\/(\w+);base64,([\s\S]+)$/);
      if (matches) {
        const ext = matches[1] === 'png' ? 'png' : 'jpg';
        const filename = `logo-${Date.now()}.${ext}`;
        fs.writeFileSync(path.join(uploadsDir, filename), matches[2], 'base64');
        settings.logo = filename;
      }
    }

    if (signature && signature.startsWith('data:')) {
      const matches = signature.match(/^data:image\/(\w+);base64,([\s\S]+)$/);
      if (matches) {
        const ext = matches[1] === 'png' ? 'png' : 'jpg';
        const filename = `signature-${Date.now()}.${ext}`;
        fs.writeFileSync(path.join(uploadsDir, filename), matches[2], 'base64');
        settings.signature = filename;
      }
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
