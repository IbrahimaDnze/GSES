const express = require('express');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Setting = require('../models/Setting');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/impayes', protect, async (req, res) => {
  try {
    const { mois, annee } = req.query;
    const m = mois || String(new Date().getMonth() + 1).padStart(2, '0');
    const a = annee || new Date().getFullYear();

    const payeIds = await Payment.distinct('eleve', {
      type: 'mensualite', mois: m, annee: parseInt(a)
    });

    const impayes = await Student.find({
      actif: true, _id: { $nin: payeIds }
    }).select('nom prenom photo matricule classe nomTuteur contactParent');

    res.json(impayes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { eleve, type, mois, annee, enRetard } = req.query;
    const filter = {};
    if (eleve) filter.eleve = eleve;
    if (type) filter.type = type;
    if (mois) filter.mois = mois;
    if (annee) filter.annee = parseInt(annee);
    const payments = await Payment.find(filter).populate('eleve', 'nom prenom photo nomTuteur contactParent');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('eleve');
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, enregistrePar: req.user._id };
    const payment = await Payment.create(data);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, autoriserRoles('admin', 'directeur', 'comptable'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });
    res.json({ message: 'Paiement supprime' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/recu', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('eleve');
    if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const settings = await Setting.findOne() || {};

    const doc = new PDFDocument({ size: 'A4', margin: 50, layout: 'portrait' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=recu-${payment._id}.pdf`);
    doc.pipe(res);

    const bgColor = '#1E3B2E';
    const lightBg = '#f0faf5';
    const borderColor = '#d4d4d4';
    const textColor = '#1f2937';
    const mutedColor = '#6b7280';
    const pageWidth = doc.page.width - 100;
    const leftX = 50;
    const rightX = doc.page.width - 50;

    doc.rect(0, 0, doc.page.width, 120).fill(bgColor);

    if (settings.logo) {
      const logoPath = path.join(__dirname, '..', 'uploads', settings.logo);
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, leftX + 15, 15, { width: 55 });
      }
    }

    const schoolName = settings.nomEcole || 'ÉCOLE CORANIQUE';
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(schoolName, leftX, 30, { align: 'center' });
    doc.fontSize(11).font('Helvetica').text('"Apprendre le Coran, c\'est construire l\'avenir"', { align: 'center' });
    const contactLine = `${settings.email ? `Email : ${settings.email}` : ''}${settings.email && settings.telephone ? '  |  ' : ''}${settings.telephone ? `Tél : ${settings.telephone}` : ''}`;
    if (contactLine) doc.fontSize(10).text(contactLine, { align: 'center' });

    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold');
    doc.text('REÇU DE PAIEMENT', leftX, 135, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor('#9ca3af').text(`N° ${payment._id}`, { align: 'center' });

    doc.moveDown(0.5);
    doc.rect(leftX, doc.y, pageWidth, 1).fill(borderColor);

    doc.moveDown(1.5);
    const infoY = doc.y;
    doc.rect(leftX, infoY, pageWidth, 90).fill(lightBg);

    doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text('ÉLÈVE', leftX + 15, infoY + 12);
    doc.fillColor(mutedColor).fontSize(10).font('Helvetica').text(`${payment.eleve.nom || ''} ${payment.eleve.prenom || ''}`, leftX + 15, infoY + 30);
    doc.text(`Tuteur : ${payment.eleve.nomTuteur || '—'}`, leftX + 15, infoY + 48);
    doc.text(`Contact : ${payment.eleve.contactParent || '—'}`, leftX + 15, infoY + 66);

    const dateStr = new Date(payment.datePaiement).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text('DATE', rightX - 145, infoY + 12);
    doc.fillColor(mutedColor).fontSize(10).font('Helvetica').text(dateStr, rightX - 145, infoY + 30);

    doc.moveDown(6);
    const tableY = doc.y;
    doc.rect(leftX, tableY, pageWidth, 1).fill(borderColor);

    const rowH = 36;
    const colW = pageWidth / 3;
    const cols = [
      { label: 'TYPE', x: leftX },
      { label: 'PÉRIODE', x: leftX + colW },
      { label: 'MONTANT', x: leftX + colW * 2 },
    ];

    doc.rect(leftX, tableY + 2, pageWidth, rowH).fill(bgColor);
    cols.forEach(c => {
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(c.label, c.x + 12, tableY + 12);
    });

    const typeLabel = { inscription: 'Inscription', mensualite: 'Mensualité', autre: 'Autre' };
    const rowY = tableY + 2 + rowH;
    doc.rect(leftX, rowY, pageWidth, rowH).fill('#ffffff');
    doc.rect(leftX, rowY, pageWidth, rowH).stroke('#e5e7eb');

    doc.fillColor(textColor).fontSize(10).font('Helvetica').text(typeLabel[payment.type] || payment.type, leftX + 12, rowY + 10);
    doc.text(payment.mois ? `${payment.mois}/${payment.annee}` : '—', leftX + colW + 12, rowY + 10);
    doc.text(`${payment.montant.toLocaleString()} F`, leftX + colW * 2 + 12, rowY + 10);

    doc.moveDown(2.5);
    const totalY = doc.y;
    doc.rect(leftX, totalY, pageWidth, 1).fill(borderColor);
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(textColor).text('TOTAL', leftX, doc.y, { continued: true });
    doc.fontSize(14).fillColor(bgColor).text(` ${payment.montant.toLocaleString()} F`, { align: 'right' });

    if (payment.modePaiement || payment.reference) {
      doc.moveDown(0.5);
      const modeLabel = { especes: 'Espèces', cheque: 'Chèque', virement: 'Virement', autre: 'Autre' };
      doc.fontSize(9).font('Helvetica').fillColor(mutedColor).text(`Mode de paiement : ${modeLabel[payment.modePaiement] || payment.modePaiement}${payment.reference ? `  |  Réf : ${payment.reference}` : ''}`);
    }

    if (settings.signature) {
      const sigPath = path.join(__dirname, '..', 'uploads', settings.signature);
      if (fs.existsSync(sigPath)) {
        doc.moveDown(3);
        const signY = doc.y;
        doc.rect(leftX, signY, pageWidth, 1).fill(borderColor);
        doc.image(sigPath, rightX - 100, signY + 8, { width: 80 });
        doc.moveDown(2);
      }
    }

    doc.fontSize(8).fillColor('#9ca3af').font('Helvetica-Oblique').text(
      'Ce reçu est généré automatiquement par le système de gestion.',
      leftX, doc.page.height - 60, { align: 'center', width: pageWidth }
    );

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
