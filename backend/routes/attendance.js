const express = require('express');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

async function verifierSeuilAbsences(attendance, io) {
  try {
    if (attendance.statut !== 'absent') return;

    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const filter = {
      type: attendance.type,
      statut: 'absent',
      date: { $gte: debutMois, $lte: finMois }
    };
    if (attendance.type === 'eleve') filter.eleve = attendance.eleve;
    else filter.enseignant = attendance.enseignant;

    const count = await Attendance.countDocuments(filter);
    if (count < 5) return;

    const personneId = attendance.type === 'eleve' ? attendance.eleve : attendance.enseignant;
    const existingAnn = await Announcement.findOne({
      categorie: 'alerte-absence',
      'metadata.personneId': personneId,
      createdAt: { $gte: debutMois }
    });
    if (existingAnn) return;

    let nom, prenom, classe;
    if (attendance.type === 'eleve') {
      const s = await Student.findById(attendance.eleve).select('nom prenom classe');
      if (!s) return;
      nom = s.nom; prenom = s.prenom; classe = s.classe;
    } else {
      const t = await Teacher.findById(attendance.enseignant).select('nom prenom');
      if (!t) return;
      nom = t.nom; prenom = t.prenom;
    }

    const personneLabel = attendance.type === 'eleve' ? 'Élève' : 'Enseignant';
    const titre = `Alerte absences : ${prenom || ''} ${nom}`;
    const contenu = `${personneLabel} ${prenom || ''} ${nom}${classe ? ` (${classe})` : ''} a atteint ${count} absences non justifiées ce mois-ci.`;

    console.log(`[AlerteAbsences] Seuil atteint pour ${personneLabel} ${prenom} ${nom} (${count} absences)`);

    const annonce = await Announcement.create({
      titre,
      contenu,
      badge: 'Urgent',
      categorie: 'alerte-absence',
      metadata: { personneId }
    });

    if (io) {
      io.to('all').emit('new-announcement', annonce);
    }

    const message = `Nouvelle annonce : ${titre}`;
    const admins = await User.find({ role: { $in: ['admin', 'directeur'] }, actif: true }).select('_id');
    const notifications = admins.map(u => ({
      destinataire: u._id,
      message,
      type: 'alerte',
      lien: '/annonces'
    }));
    const saved = await Notification.insertMany(notifications);

    if (io) {
      saved.forEach(n => io.to(`user:${n.destinataire}`).emit('new-notification', n));
    }
  } catch (error) {
    console.error('[AlerteAbsences] Erreur:', error);
  }
}

router.get('/', protect, async (req, res) => {
  try {
    const { date, type, eleve, enseignant, mois, annee } = req.query;
    const filter = {};
    if (date) filter.date = new Date(date);
    if (type) filter.type = type;
    if (eleve) filter.eleve = eleve;
    if (enseignant) filter.enseignant = enseignant;
    if (mois && annee) {
      const debut = new Date(annee, mois - 1, 1);
      const fin = new Date(annee, mois, 0);
      filter.date = { $gte: debut, $lte: fin };
    }
    const attendances = await Attendance.find(filter)
      .populate('eleve', 'nom prenom')
      .populate('enseignant', 'nom prenom');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { type, date, statut, eleveId, enseignantId, justification } = req.body;
    const data = {
      type,
      date: new Date(date),
      statut,
      justification,
      enregistrePar: req.user._id
    };
    if (type === 'eleve') data.eleve = eleveId;
    else data.enseignant = enseignantId;

    const io = req.app.get('io');
    const existing = await Attendance.findOne(
      type === 'eleve' ? { date: data.date, eleve: data.eleve } : { date: data.date, enseignant: data.enseignant }
    );
    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      verifierSeuilAbsences(existing, io);
      return res.json(existing);
    }
    const attendance = await Attendance.create(data);
    verifierSeuilAbsences(attendance, io);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/rapport-mensuel', protect, async (req, res) => {
  try {
    const { mois, annee, type } = req.query;
    const debut = new Date(annee, mois - 1, 1);
    const fin = new Date(annee, mois, 0);
    const filter = { date: { $gte: debut, $lte: fin } };
    if (type) filter.type = type;
    const attendances = await Attendance.find(filter)
      .populate('eleve', 'nom prenom')
      .populate('enseignant', 'nom prenom');
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verifier-seuils', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const io = req.app.get('io');
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const results = { eleves: 0, enseignants: 0 };

    const absencesEleves = await Attendance.aggregate([
      { $match: { type: 'eleve', statut: 'absent', date: { $gte: debutMois, $lte: finMois } } },
      { $group: { _id: '$eleve', count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } }
    ]);
    for (const item of absencesEleves) {
      const existingAnn = await Announcement.findOne({
        categorie: 'alerte-absence',
        'metadata.personneId': item._id,
        createdAt: { $gte: debutMois }
      });
      if (!existingAnn) {
        const att = await Attendance.findOne({ eleve: item._id, type: 'eleve' }).sort('-createdAt');
        if (att) {
          att.statut = 'absent';
          await verifierSeuilAbsences(att, io);
          results.eleves++;
        }
      }
    }

    const absencesEnseignants = await Attendance.aggregate([
      { $match: { type: 'enseignant', statut: 'absent', date: { $gte: debutMois, $lte: finMois } } },
      { $group: { _id: '$enseignant', count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } }
    ]);
    for (const item of absencesEnseignants) {
      const existingAnn = await Announcement.findOne({
        categorie: 'alerte-absence',
        'metadata.personneId': item._id,
        createdAt: { $gte: debutMois }
      });
      if (!existingAnn) {
        const att = await Attendance.findOne({ enseignant: item._id, type: 'enseignant' }).sort('-createdAt');
        if (att) {
          att.statut = 'absent';
          await verifierSeuilAbsences(att, io);
          results.enseignants++;
        }
      }
    }

    res.json({ message: `${results.eleves} élèves et ${results.enseignants} enseignants alertés`, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
