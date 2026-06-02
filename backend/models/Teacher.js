const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  identifiant: { type: String },
  email: { type: String },
  dateNaissance: { type: Date },
  sexe: { type: String },
  telephone: { type: String, required: true },
  adresse: { type: String },
  specialite: { type: String },
  matiere: { type: String },
  niveauEnseignement: { type: String },
  classes: [{ type: String }],
  dateEmbauche: { type: Date, default: Date.now },
  salaire: { type: Number, default: 0 },
  photo: { type: String },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
