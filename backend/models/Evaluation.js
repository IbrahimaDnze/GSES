const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  eleve: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  sourate: { type: String, required: true },
  noteRecitation: { type: Number, min: 0, max: 20 },
  noteTajwid: { type: Number, min: 0, max: 20 },
  niveau: {
    type: String,
    enum: ['Alif', 'Ba', 'Coran Debutant', 'Memorisation', 'Tajwid']
  },
  dateEvaluation: { type: Date, default: Date.now },
  commentaire: { type: String },
  evaluateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
