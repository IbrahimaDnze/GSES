const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);