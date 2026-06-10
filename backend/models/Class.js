const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  matieres: [{ type: String }],
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', set: v => v === '' ? undefined : v },
  emploiDuTemps: {
    lundi: { matin: String, apresMidi: String },
    mardi: { matin: String, apresMidi: String },
    mercredi: { matin: String, apresMidi: String },
    jeudi: { matin: String, apresMidi: String },
    vendredi: { matin: String, apresMidi: String },
    samedi: { matin: String, apresMidi: String }
  },
  description: { type: String },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
