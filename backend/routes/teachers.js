const express = require('express');
const Teacher = require('../models/Teacher');
const Setting = require('../models/Setting');
const Attendance = require('../models/Attendance');
const { protect, autoriserRoles } = require('../middleware/auth');
const { uploadImage, fetchImageBuffer } = require('../config/cloudinary');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Enseignant non trouve' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const data = req.body;
    if (data.photo) data.photo = await uploadImage(data.photo, 'teachers');
    const teacher = await Teacher.create(data);
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, autoriserRoles('admin', 'directeur'), async (req, res) => {
  try {
    const data = req.body;
    if (data.photo) data.photo = await uploadImage(data.photo, 'teachers');
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!teacher) return res.status(404).json({ message: 'Enseignant non trouve' });
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, autoriserRoles('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Enseignant non trouve' });
    await Attendance.deleteMany({ enseignant: req.params.id, type: 'enseignant' });
    res.json({ message: 'Enseignant supprime avec ses presences liees' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/export/pdf', protect, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    const settings = await Setting.findOne() || {};
    const schoolName = settings.nomEcole || 'ÉCOLE CORANIQUE';

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 30, layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=enseignants.pdf');
    doc.pipe(res);

    if (settings.logo) {
      const logoBuf = await fetchImageBuffer(settings.logo);
      if (logoBuf) doc.image(logoBuf, 30, 15, { width: 35 });
    }

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1E3B2E').text(schoolName, { align: 'center' });
    doc.fontSize(11).text('LISTE DES ENSEIGNANTS', { align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text(`Généré le ${new Date().toLocaleDateString('fr-FR')} · ${teachers.length} enseignants`, { align: 'center' });
    doc.moveDown(1);

    const headers = ['N°', 'Nom', 'Prénom', 'ID', 'Téléphone', 'Matière', 'Classes', 'Date embauche', 'Statut'];
    const colW = [25, 65, 65, 55, 60, 55, 70, 60, 40];
    let y = doc.y;

    const drawHeader = () => {
      doc.rect(30, y, doc.page.width - 60, 18).fill('#1E3B2E');
      let x = 30;
      headers.forEach((h, i) => {
        doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(h, x + 3, y + 5, { width: colW[i], align: 'left' });
        x += colW[i];
      });
      y += 18;
    };

    drawHeader();

    teachers.forEach((t, idx) => {
      if (y > doc.page.height - 40) { doc.addPage(); y = 30; drawHeader(); }
      if (idx % 2 === 0) doc.rect(30, y, doc.page.width - 60, 16).fill('#f9fafb');
      let x = 30;
      const vals = [
        String(idx + 1), t.nom || '', t.prenom || '',
        t.identifiant || `ENS-${String(t._id).padStart(4, '0')}`,
        t.telephone || '—', t.matiere || '—',
        (t.classes || []).join(', ') || '—',
        t.dateEmbauche ? new Date(t.dateEmbauche).toLocaleDateString('fr-FR') : '—',
        t.actif ? 'Actif' : 'Inactif',
      ];
      vals.forEach((v, i) => {
        doc.fillColor('#1f2937').fontSize(7).font('Helvetica').text(v, x + 3, y + 4, { width: colW[i], align: 'left' });
        x += colW[i];
      });
      y += 16;
    });

    if (settings.signature) {
      doc.moveDown(1);
      const sigBuf = await fetchImageBuffer(settings.signature);
      if (sigBuf) doc.image(sigBuf, doc.page.width - 130, doc.y, { width: 80 });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
