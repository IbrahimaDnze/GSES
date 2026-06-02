const express = require('express');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Evaluation = require('../models/Evaluation');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/eleves/pdf', protect, async (req, res) => {
  try {
    const students = await Student.find({ actif: true });
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=liste-eleves.pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Liste des Eleves', { align: 'center' });
    doc.moveDown();
    students.forEach((s, i) => {
      doc.fontSize(11).text(
        `${i + 1}. ${s.nom} ${s.prenom} - ${s.niveauCoranique || 'N/A'} - Tuteur: ${s.nomTuteur} - Tel: ${s.contactParent}`
      );
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/eleves/excel', protect, async (req, res) => {
  try {
    const students = await Student.find({ actif: true });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Eleves');
    sheet.columns = [
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prenom', key: 'prenom', width: 20 },
      { header: 'Niveau', key: 'niveau', width: 20 },
      { header: 'Tuteur', key: 'tuteur', width: 25 },
      { header: 'Contact', key: 'contact', width: 20 }
    ];
    students.forEach(s => sheet.addRow({
      nom: s.nom, prenom: s.prenom, niveau: s.niveauCoranique,
      tuteur: s.nomTuteur, contact: s.contactParent
    }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=liste-eleves.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/paiements/pdf', protect, async (req, res) => {
  try {
    const { mois, annee } = req.query;
    const filter = {};
    if (mois && annee) filter.mois = mois; filter.annee = parseInt(annee);
    const payments = await Payment.find(filter).populate('eleve', 'nom prenom');
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport-paiements.pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Rapport des Paiements', { align: 'center' });
    doc.moveDown();
    let total = 0;
    payments.forEach((p, i) => {
      doc.fontSize(11).text(
        `${i + 1}. ${p.eleve?.nom || 'N/A'} ${p.eleve?.prenom || ''} - ${p.type} - ${p.montant} Fcfa - ${new Date(p.datePaiement).toLocaleDateString('fr-FR')}`
      );
      total += p.montant;
    });
    doc.moveDown().fontSize(14).text(`Total: ${total} Fcfa`, { align: 'right' });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/paiements/excel', protect, async (req, res) => {
  try {
    const { mois, annee } = req.query;
    const filter = {};
    if (mois && annee) { filter.mois = mois; filter.annee = parseInt(annee); }
    const payments = await Payment.find(filter).populate('eleve', 'nom prenom');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Paiements');
    sheet.columns = [
      { header: 'Eleve', key: 'eleve', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Mode', key: 'mode', width: 15 }
    ];
    payments.forEach(p => sheet.addRow({
      eleve: `${p.eleve?.nom || ''} ${p.eleve?.prenom || ''}`,
      type: p.type, montant: p.montant,
      date: new Date(p.datePaiement).toLocaleDateString('fr-FR'),
      mode: p.modePaiement
    }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport-paiements.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/presences/pdf', protect, async (req, res) => {
  try {
    const { mois, annee, type } = req.query;
    const debut = new Date(annee, mois - 1, 1);
    const fin = new Date(annee, mois, 0);
    const filter = { date: { $gte: debut, $lte: fin } };
    if (type) filter.type = type;
    const attendances = await Attendance.find(filter)
      .populate('eleve', 'nom prenom')
      .populate('enseignant', 'nom prenom');
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport-presences.pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Rapport des Presences', { align: 'center' });
    doc.moveDown();
    attendances.forEach((a, i) => {
      const nom = a.type === 'eleve' ? `${a.eleve?.nom || ''} ${a.eleve?.prenom || ''}` : `${a.enseignant?.nom || ''} ${a.enseignant?.prenom || ''}`;
      doc.fontSize(11).text(
        `${i + 1}. ${nom} - ${new Date(a.date).toLocaleDateString('fr-FR')} - ${a.statut}`
      );
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
