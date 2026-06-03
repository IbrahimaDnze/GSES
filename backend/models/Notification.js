const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['annonce', 'info', 'alerte'], default: 'info' },
  lu: { type: Boolean, default: false },
  lien: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
