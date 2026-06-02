const express = require('express');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Setting = require('../models/Setting');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { type, ids } = req.body;
    if (!type || !ids || !ids.length) return res.status(400).json({ message: 'Type et liste d\'IDs requis' });

    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const settings = await Setting.findOne() || {};
    const schoolName = settings.nomEcole || 'ÉCOLE CORANIQUE';

    let data;
    if (type === 'eleve') {
      data = await Student.find({ _id: { $in: ids } });
    } else if (type === 'enseignant') {
      data = await Teacher.find({ _id: { $in: ids } });
    } else {
      return res.status(400).json({ message: 'Type invalide' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 0, layout: 'portrait' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cartes-${type}s.pdf`);
    doc.pipe(res);

    const cardW = 245;
    const cardH = 155;
    const cols = 2;
    const marginX = (doc.page.width - cols * cardW) / 2;
    const marginY = 28;
    const gapX = 14;
    const gapY = 16;

    const perPage = cols * 3;

    data.forEach((item, idx) => {
      if (idx > 0 && idx % perPage === 0) doc.addPage();
      const pageIdx = idx % perPage;
      const col = pageIdx % cols;
      const row = Math.floor(pageIdx / cols);
      const x = marginX + col * (cardW + gapX);
      const y = marginY + row * (cardH + gapY);

      const r = 10;

      doc.roundedRect(x, y, cardW, cardH, r).lineWidth(1.5).stroke('#1E3B2E');

      doc.roundedRect(x, y, cardW, 42, r).fill('#1E3B2E');

      if (settings.logo) {
        const logoPath = path.join(__dirname, '..', 'uploads', settings.logo);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, x + 12, y + 6, { width: 28 });
        }
      }

      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(schoolName, x + 46, y + 8, { width: cardW - 56, align: 'center' });
      doc.fontSize(6.5).font('Helvetica').fillColor('rgba(255,255,255,0.7)').text('CARTE ' + (type === 'eleve' ? "D'ÉLÈVE" : "D'ENSEIGNANT"), x + 46, y + 26, { width: cardW - 56, align: 'center' });

      const photoSize = 60;
      const photoX = x + 14;
      const photoY = y + 54;

      doc.roundedRect(photoX, photoY, photoSize, photoSize, 8).lineWidth(1).stroke('#d4d4d4');
      doc.roundedRect(photoX + 2, photoY + 2, photoSize - 4, photoSize - 4, 6).fill('#f9fafb');
      if (item.photo) {
        const photoPath = path.join(__dirname, '..', 'uploads', item.photo);
        if (fs.existsSync(photoPath)) {
          doc.image(photoPath, photoX + 2, photoY + 2, { width: photoSize - 4, height: photoSize - 4 });
        }
      }

      const textX = photoX + photoSize + 14;
      const textW = cardW - textX - 12;

      doc.fillColor('#1E3B2E').fontSize(10).font('Helvetica-Bold').text(`${item.nom} ${item.prenom}`, textX, y + 52, { width: textW });

      doc.fontSize(6.5).font('Helvetica').fillColor('#6b7280').text(type === 'eleve' ? 'Élève' : 'Enseignant', textX, y + 67, { width: textW });

      doc.moveTo(textX, y + 78).lineTo(x + cardW - 10, y + 78).lineWidth(0.5).stroke('#e5e7eb');

      let iy = y + 84;
      const lineH = 13.5;

      const field = (label, value) => {
        doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#1f2937').text(label, textX, iy, { width: 52 });
        doc.font('Helvetica').fillColor('#6b7280').text(value || '—', textX + 52, iy, { width: textW - 52 });
        iy += lineH;
      };

      if (type === 'eleve') {
        field('Matricule', item.matricule || `ETU-${String(item._id).padStart(4, '0')}`);
        field('Classe', item.classe);
        field('Niveau', item.niveauCoranique);
        field('Tuteur', item.nomTuteur);
        field('Contact', item.contactParent);
      } else {
        field('ID', item.identifiant || `ENS-${String(item._id).padStart(4, '0')}`);
        field('Matière', item.matiere);
        field('Téléphone', item.telephone);
        field('Email', item.email);
        field('Classe(s)', (item.classes || []).join(', '));
      }

      doc.rect(x, y + cardH - 18, cardW, 18).fill('#f9fafb');

      doc.fillColor('#9ca3af').fontSize(5.5).font('Helvetica').text(
        `${schoolName} · ${new Date().toLocaleDateString('fr-FR')}`,
        x + 10, y + cardH - 13, { width: cardW - 20, align: 'center' }
      );
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
