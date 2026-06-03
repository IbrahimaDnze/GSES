const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  contenu: { type: String, required: true },
  badge: { type: String, default: 'Info' },
  categorie: { type: String, default: 'generale' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  actif: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
