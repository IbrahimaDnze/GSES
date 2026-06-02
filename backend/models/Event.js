const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['examen', 'reunion', 'evenement', 'programme'], default: 'programme' },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
