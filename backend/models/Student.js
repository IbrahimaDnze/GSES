const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  matricule: { type: String },
  dateNaissance: { type: Date },
  lieuNaissance: { type: String },
  sexe: { type: String, enum: ['garcon', 'fille'] },
  photo: { type: String },
  classe: { type: String },
  niveauCoranique: { type: String },
  nomTuteur: { type: String, required: true },
  contactParent: { type: String, required: true },
  adresse: { type: String },
  dateInscription: { type: Date, default: Date.now },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
