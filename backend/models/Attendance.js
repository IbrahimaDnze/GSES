const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  eleve: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  type: { type: String, enum: ['eleve', 'enseignant'], required: true },
  date: { type: Date, required: true },
  statut: {
    type: String,
    enum: ['present', 'absent', 'retard', 'justifie'],
    required: true
  },
  justification: { type: String },
  enregistrePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
