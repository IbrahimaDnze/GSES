const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  nomEcole: { type: String, default: 'École Coranique Al Nour' },
  anneeScolaire: { type: String, default: '2025 - 2026' },
  email: { type: String, default: '' },
  langue: { type: String, default: 'Français' },
  devise: { type: String, default: 'Franc Guinée (GNF)' },
  logo: { type: String, default: '' },
  signature: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
