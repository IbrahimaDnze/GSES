const express = require('express');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const Setting = require('../models/Setting');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Evaluation = require('../models/Evaluation');
const { protect, autoriserRoles } = require('../middleware/auth');
const router = express.Router();

const sauvegarderPhoto = (photo, prefix) => {
  if (!photo || !photo.startsWith('data:image')) return photo;
  const matches = photo.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!matches) return photo;
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${prefix}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(__dirname, '..', 'uploads', filename), buffer);
  return filename;
};

router.get('/', protect, async (req, res) => {
  try {
    const { classe, actif, niveau } = req.query;
    const filter = {};
    if (classe) filter.classe = classe;
    if (actif !== undefined) filter.actif = actif === 'true';
    if (niveau) filter.niveauCoranique = niveau;
    const students = await Student.find(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Eleve non trouve' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const data = req.body;
    if (data.photo) data.photo = sauvegarderPhoto(data.photo, 'student');
    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const data = req.body;
    if (data.photo) data.photo = sauvegarderPhoto(data.photo, 'student');
    const student = await Student.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!student) return res.status(404).json({ message: 'Eleve non trouve' });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Eleve non trouve' });
    await Attendance.deleteMany({ eleve: req.params.id });
    await Payment.deleteMany({ eleve: req.params.id });
    await Evaluation.deleteMany({ eleve: req.params.id });
    res.json({ message: 'Eleve supprime avec toutes ses donnees liees' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/export/pdf', protect, async (req, res) => {
  try {
    const { classe, actif, niveau } = req.query;
    const filter = {};
    if (classe) filter.classe = classe;
    if (actif !== undefined) filter.actif = actif === 'true';
    if (niveau) filter.niveauCoranique = niveau;
    const students = await Student.find(filter);

    const settings = await Setting.findOne() || {};
    const schoolName = settings.nomEcole || 'ÉCOLE CORANIQUE';

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 30, layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=eleves.pdf');
    doc.pipe(res);

    if (settings.logo) {
      const logoPath = path.join(__dirname, '..', 'uploads', settings.logo);
      if (fs.existsSync(logoPath)) doc.image(logoPath, 30, 15, { width: 35 });
    }

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1E3B2E').text(schoolName, { align: 'center' });
    doc.fontSize(11).text('LISTE DES ÉLÈVES', { align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text(`Généré le ${new Date().toLocaleDateString('fr-FR')} · ${students.length} élèves`, { align: 'center' });
    doc.moveDown(1);

    const headers = ['N°', 'Nom', 'Prénom', 'Matricule', 'Sexe', 'Classe', 'Niveau', 'Tuteur', 'Téléphone', 'Statut'];
    const colW = [25, 65, 65, 55, 35, 50, 60, 65, 65, 40];
    const tableTop = doc.y;

    let y = tableTop;
    doc.rect(30, y, doc.page.width - 60, 18).fill('#1E3B2E');
    let x = 30;
    headers.forEach((h, i) => {
      doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(h, x + 3, y + 5, { width: colW[i], align: 'left' });
      x += colW[i];
    });

    students.forEach((s, idx) => {
      y += 18;
      if (y > doc.page.height - 40) {
        doc.addPage();
        y = 30;
        doc.rect(30, y, doc.page.width - 60, 18).fill('#1E3B2E');
        x = 30;
        headers.forEach((h, i) => {
          doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(h, x + 3, y + 5, { width: colW[i], align: 'left' });
          x += colW[i];
        });
        y += 18;
      }
      if (idx % 2 === 0) doc.rect(30, y, doc.page.width - 60, 16).fill('#f9fafb');
      x = 30;
      const vals = [
        String(idx + 1),
        s.nom || '',
        s.prenom || '',
        s.matricule || `ETU-${String(s._id).padStart(4, '0')}`,
        s.sexe === 'garcon' ? 'Garçon' : 'Fille',
        s.classe || '—',
        s.niveauCoranique || '—',
        s.nomTuteur || '—',
        s.contactParent || '—',
        s.actif ? 'Actif' : 'Inactif',
      ];
      vals.forEach((v, i) => {
        doc.fillColor('#1f2937').fontSize(7).font('Helvetica').text(v, x + 3, y + 4, { width: colW[i], align: 'left' });
        x += colW[i];
      });
    });

    if (settings.signature) {
      doc.moveDown(1);
      const sigPath = path.join(__dirname, '..', 'uploads', settings.signature);
      if (fs.existsSync(sigPath)) doc.image(sigPath, doc.page.width - 130, doc.y, { width: 80 });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
