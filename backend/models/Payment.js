const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  eleve: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: {
    type: String,
    enum: ['inscription', 'mensualite', 'autre'],
    required: true
  },
  montant: { type: Number, required: true },
  mois: { type: String },
  annee: { type: Number },
  datePaiement: { type: Date, default: Date.now },
  modePaiement: {
    type: String,
    enum: ['especes', 'cheque', 'virement', 'autre'],
    default: 'especes'
  },
  reference: { type: String },
  notes: { type: String },
  enregistrePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
