const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);