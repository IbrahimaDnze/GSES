const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let students = [
  { _id: '1', nom: 'Diop', prenom: 'Aminata', dateNaissance: '2012-05-15', sexe: 'fille', niveauCoranique: 'Alif', nomTuteur: 'M. Diop', contactParent: '77 123 45 67', adresse: 'Dakar', dateInscription: '2024-09-01', actif: true, photo: '', classe: 'Alif - Section A' },
  { _id: '2', nom: 'Fall', prenom: 'Ousmane', dateNaissance: '2011-08-22', sexe: 'garcon', niveauCoranique: 'Ba', nomTuteur: 'Mme Fall', contactParent: '78 234 56 78', adresse: 'Thies', dateInscription: '2024-09-01', actif: true, photo: '', classe: 'Ba - Section A' },
  { _id: '3', nom: 'Ndiaye', prenom: 'Fatou', dateNaissance: '2010-03-10', sexe: 'fille', niveauCoranique: 'Coran Debutant', nomTuteur: 'M. Ndiaye', contactParent: '76 345 67 89', adresse: 'Saint-Louis', dateInscription: '2023-10-15', actif: true, photo: '', classe: 'Coran Debutant' },
  { _id: '4', nom: 'Sow', prenom: 'Mamadou', dateNaissance: '2009-11-05', sexe: 'garcon', niveauCoranique: 'Memorisation', nomTuteur: 'Mme Sow', contactParent: '70 456 78 90', adresse: 'Dakar', dateInscription: '2023-10-15', actif: true, photo: '', classe: 'Memorisation' },
  { _id: '5', nom: 'Ba', prenom: 'Aicha', dateNaissance: '2013-01-30', sexe: 'fille', niveauCoranique: 'Alif', nomTuteur: 'M. Ba', contactParent: '77 567 89 01', adresse: 'Pikine', dateInscription: '2025-01-10', actif: true, photo: '', classe: 'Alif - Section A' },
  { _id: '6', nom: 'Kane', prenom: 'Ibrahim', dateNaissance: '2008-07-18', sexe: 'garcon', niveauCoranique: 'Tajwid', nomTuteur: 'M. Kane', contactParent: '78 678 90 12', adresse: 'Dakar', dateInscription: '2023-10-15', actif: true, photo: '', classe: 'Tajwid Avance' },
  { _id: '7', nom: 'Thiam', prenom: 'Mariama', dateNaissance: '2012-11-03', sexe: 'fille', niveauCoranique: 'Alif', nomTuteur: 'M. Thiam', contactParent: '77 789 01 23', adresse: 'Guédiawaye', dateInscription: '2025-06-05', actif: true, photo: '', classe: 'Alif - Section A' },
  { _id: '8', nom: 'Gueye', prenom: 'Abdou', dateNaissance: '2010-06-20', sexe: 'garcon', niveauCoranique: 'Ba', nomTuteur: 'Mme Gueye', contactParent: '78 890 12 34', adresse: 'Dakar', dateInscription: '2024-10-01', actif: true, photo: '', classe: 'Ba - Section A' },
  { _id: '9', nom: 'Faye', prenom: 'Khady', dateNaissance: '2011-09-14', sexe: 'fille', niveauCoranique: 'Memorisation', nomTuteur: 'M. Faye', contactParent: '76 901 23 45', adresse: 'Rufisque', dateInscription: '2023-10-15', actif: true, photo: '', classe: 'Memorisation' },
  { _id: '10', nom: 'Camara', prenom: 'Lamine', dateNaissance: '2007-04-08', sexe: 'garcon', niveauCoranique: 'Tajwid', nomTuteur: 'Mme Camara', contactParent: '70 012 34 56', adresse: 'Dakar', dateInscription: '2023-10-15', actif: true, photo: '', classe: 'Tajwid Avance' },
  { _id: '11', nom: 'Diallo', prenom: 'Hawa', dateNaissance: '2013-07-25', sexe: 'fille', niveauCoranique: 'Alif', nomTuteur: 'M. Diallo', contactParent: '77 111 22 33', adresse: 'Pikine', dateInscription: '2025-06-10', actif: true, photo: '', classe: 'Alif - Section A' },
  { _id: '12', nom: 'Sall', prenom: 'Moussa', dateNaissance: '2011-12-01', sexe: 'garcon', niveauCoranique: 'Coran Debutant', nomTuteur: 'Mme Sall', contactParent: '78 222 33 44', adresse: 'Thies', dateInscription: '2024-09-01', actif: true, photo: '', classe: 'Coran Debutant' },
  { _id: '13', nom: 'Mbaye', prenom: 'Astou', dateNaissance: '2009-02-18', sexe: 'fille', niveauCoranique: 'Memorisation', nomTuteur: 'M. Mbaye', contactParent: '76 333 44 55', adresse: 'Dakar', dateInscription: '2023-10-15', actif: true, photo: '', classe: 'Memorisation' },
  { _id: '14', nom: 'Niang', prenom: 'Cheikh', dateNaissance: '2012-10-11', sexe: 'garcon', niveauCoranique: 'Ba', nomTuteur: 'Mme Niang', contactParent: '70 444 55 66', adresse: 'Saint-Louis', dateInscription: '2024-09-01', actif: false, photo: '', classe: 'Ba - Section A' },
  { _id: '15', nom: 'Sy', prenom: 'Rokhaya', dateNaissance: '2010-01-29', sexe: 'fille', niveauCoranique: 'Tajwid', nomTuteur: 'M. Sy', contactParent: '77 555 66 77', adresse: 'Dakar', dateInscription: '2023-10-15', actif: true, photo: '', classe: 'Tajwid Avance' },
  { _id: '16', nom: 'Wade', prenom: 'Idrissa', dateNaissance: '2008-08-05', sexe: 'garcon', niveauCoranique: 'Memorisation', nomTuteur: 'Mme Wade', contactParent: '78 666 77 88', adresse: 'Dakar', dateInscription: '2023-10-15', actif: true, photo: '', classe: 'Memorisation' },
];

let teachers = [
  { _id: 't1', nom: 'Hassan', prenom: 'Ali', email: 'ali.hassan@ecole.com', telephone: '77 111 22 33', specialite: 'Tajwid', matiere: 'Tajwid', classes: ['Tajwid Avancé', 'Tajwid Débutant'], dateEmbauche: '2023-01-15', salaire: 200000, photo: '', actif: true },
  { _id: 't2', nom: 'Sylla', prenom: 'Mariam', email: 'm.sylla@ecole.com', telephone: '78 222 33 44', specialite: 'Coran', matiere: 'Coran', classes: ['Mémorisation', 'Hifz'], dateEmbauche: '2023-02-01', salaire: 180000, photo: '', actif: true },
  { _id: 't3', nom: 'Diallo', prenom: 'Amadou', email: 'a.diallo@ecole.com', telephone: '76 333 44 55', specialite: 'Langue Arabe', matiere: 'Langue Arabe', classes: ['Nourania', 'Juz 1'], dateEmbauche: '2023-09-01', salaire: 150000, photo: '', actif: true },
  { _id: 't4', nom: 'Dieng', prenom: 'Fatima', email: 'f.dieng@ecole.com', telephone: '77 444 55 66', specialite: 'Fiqh', matiere: 'Fiqh', classes: ['Juz 2', 'Juz 3'], dateEmbauche: '2024-01-15', salaire: 190000, photo: '', actif: true },
  { _id: 't5', nom: 'Sarr', prenom: 'Moustapha', email: 'm.sarr@ecole.com', telephone: '78 555 66 77', specialite: 'Hadith', matiere: 'Hadith', classes: ['Juz 3', 'Hifz'], dateEmbauche: '2024-03-01', salaire: 170000, photo: '', actif: true },
  { _id: 't6', nom: 'Ka', prenom: 'Aissatou', email: 'a.ka@ecole.com', telephone: '76 666 77 88', specialite: 'Tafsir', matiere: 'Tafsir', classes: ['Mémorisation', 'Juz 2'], dateEmbauche: '2024-06-01', salaire: 160000, photo: '', actif: true },
  { _id: 't7', nom: 'Seck', prenom: 'Oumar', email: 'o.seck@ecole.com', telephone: '70 777 88 99', specialite: 'Aqida', matiere: 'Aqida', classes: ['Nourania', 'Juz 1'], dateEmbauche: '2025-01-10', salaire: 140000, photo: '', actif: false },
  { _id: 't8', nom: 'Mane', prenom: 'Rokhy', email: 'r.mane@ecole.com', telephone: '77 888 99 00', specialite: 'Coran', matiere: 'Coran', classes: ['Nourania'], dateEmbauche: '2025-06-01', salaire: 130000, photo: '', actif: true },
];

let classes = [
  { _id: 'c1', nom: 'Alif - Section A', niveau: 'Alif', enseignant: { _id: 't3', nom: 'Diallo', prenom: 'Amadou' }, nombreEleves: 2, description: 'Apprentissage des lettres arabes', emploiDuTemps: { lundi: { matin: '08:00-10:00', apresMidi: null }, mardi: { matin: '08:00-10:00', apresMidi: null }, mercredi: { matin: null, apresMidi: '14:00-16:00' }, jeudi: { matin: '08:00-10:00', apresMidi: null }, vendredi: { matin: null, apresMidi: null }, samedi: { matin: '09:00-12:00', apresMidi: null } }, actif: true },
  { _id: 'c2', nom: 'Ba - Section A', niveau: 'Ba', enseignant: null, nombreEleves: 1, description: 'Lecture de mots arabes', emploiDuTemps: {}, actif: true },
  { _id: 'c3', nom: 'Coran Debutant', niveau: 'Coran Debutant', enseignant: null, nombreEleves: 1, description: 'Premieres sourates', emploiDuTemps: {}, actif: true },
  { _id: 'c4', nom: 'Memorisation', niveau: 'Memorisation', enseignant: { _id: 't2', nom: 'Sylla', prenom: 'Mariam' }, nombreEleves: 1, description: 'Memorisation du Coran', emploiDuTemps: {}, actif: true },
  { _id: 'c5', nom: 'Tajwid Avance', niveau: 'Tajwid', enseignant: { _id: 't1', nom: 'Hassan', prenom: 'Ali' }, nombreEleves: 1, description: 'Regles de recitation', emploiDuTemps: {}, actif: true },
];

let evaluations = [
  { _id: 'e1', eleve: { _id: '1', nom: 'Diop', prenom: 'Aminata' }, sourate: 'Al-Fatiha', noteRecitation: 15, noteTajwid: 14, niveau: 'Alif', dateEvaluation: '2025-05-10', commentaire: 'Bonne recitation' },
  { _id: 'e2', eleve: { _id: '1', nom: 'Diop', prenom: 'Aminata' }, sourate: 'An-Nas', noteRecitation: 17, noteTajwid: 16, niveau: 'Alif', dateEvaluation: '2025-05-20', commentaire: 'Progression' },
  { _id: 'e3', eleve: { _id: '2', nom: 'Fall', prenom: 'Ousmane' }, sourate: 'Al-Ikhlas', noteRecitation: 12, noteTajwid: 11, niveau: 'Ba', dateEvaluation: '2025-05-15', commentaire: 'A besoin de pratique' },
  { _id: 'e4', eleve: { _id: '4', nom: 'Sow', prenom: 'Mamadou' }, sourate: 'Ya-Sin', noteRecitation: 18, noteTajwid: 17, niveau: 'Memorisation', dateEvaluation: '2025-05-18', commentaire: 'Excellent' },
  { _id: 'e5', eleve: { _id: '6', nom: 'Kane', prenom: 'Ibrahim' }, sourate: 'Al-Baqara 1-10', noteRecitation: 16, noteTajwid: 15, niveau: 'Tajwid', dateEvaluation: '2025-05-12', commentaire: 'Bien' },
];

let payments = [
  { _id: 'p1', eleve: { _id: '1', nom: 'Diop', prenom: 'Aminata', nomTuteur: 'M. Diop', contactParent: '77 123 45 67' }, type: 'inscription', montant: 25000, mois: null, annee: null, datePaiement: '2025-09-01', modePaiement: 'especes', reference: '' },
  { _id: 'p2', eleve: { _id: '1', nom: 'Diop', prenom: 'Aminata', nomTuteur: 'M. Diop', contactParent: '77 123 45 67' }, type: 'mensualite', montant: 15000, mois: '01', annee: 2025, datePaiement: '2025-01-05', modePaiement: 'especes', reference: '' },
  { _id: 'p3', eleve: { _id: '1', nom: 'Diop', prenom: 'Aminata', nomTuteur: 'M. Diop', contactParent: '77 123 45 67' }, type: 'mensualite', montant: 15000, mois: '02', annee: 2025, datePaiement: '2025-02-03', modePaiement: 'virement', reference: 'VIR-2025-001' },
  { _id: 'p4', eleve: { _id: '2', nom: 'Fall', prenom: 'Ousmane', nomTuteur: 'Mme Fall', contactParent: '78 234 56 78' }, type: 'inscription', montant: 25000, mois: null, annee: null, datePaiement: '2025-09-01', modePaiement: 'cheque', reference: 'CHQ-123' },
  { _id: 'p5', eleve: { _id: '4', nom: 'Sow', prenom: 'Mamadou', nomTuteur: 'Mme Sow', contactParent: '70 456 78 90' }, type: 'mensualite', montant: 15000, mois: '03', annee: 2025, datePaiement: '2025-03-10', modePaiement: 'especes', reference: '' },
  { _id: 'p6', eleve: { _id: '3', nom: 'Ndiaye', prenom: 'Fatou', nomTuteur: 'M. Ndiaye', contactParent: '76 345 67 89' }, type: 'mensualite', montant: 15000, mois: '03', annee: 2025, datePaiement: '2025-03-12', modePaiement: 'especes', reference: '' },
];

let attendances = [
  { _id: 'a1', eleve: { _id: '1', nom: 'Diop', prenom: 'Aminata' }, type: 'eleve', date: '2025-06-01', statut: 'present' },
  { _id: 'a2', eleve: { _id: '2', nom: 'Fall', prenom: 'Ousmane' }, type: 'eleve', date: '2025-06-01', statut: 'present' },
  { _id: 'a3', eleve: { _id: '3', nom: 'Ndiaye', prenom: 'Fatou' }, type: 'eleve', date: '2025-06-01', statut: 'absent' },
  { _id: 'a4', eleve: { _id: '4', nom: 'Sow', prenom: 'Mamadou' }, type: 'eleve', date: '2025-06-01', statut: 'present' },
  { _id: 'a5', eleve: { _id: '5', nom: 'Ba', prenom: 'Aicha' }, type: 'eleve', date: '2025-06-01', statut: 'retard' },
  { _id: 'a6', eleve: { _id: '6', nom: 'Kane', prenom: 'Ibrahim' }, type: 'eleve', date: '2025-06-01', statut: 'present' },
  { _id: 'a7', enseignant: { _id: 't1', nom: 'Hassan', prenom: 'Ali' }, type: 'enseignant', date: '2025-06-01', statut: 'present' },
  { _id: 'a8', enseignant: { _id: 't2', nom: 'Sylla', prenom: 'Mariam' }, type: 'enseignant', date: '2025-06-01', statut: 'present' },
  { _id: 'a9', enseignant: { _id: 't3', nom: 'Diallo', prenom: 'Amadou' }, type: 'enseignant', date: '2025-06-01', statut: 'absent' },
];

let users = [
  { _id: 'u1', nom: 'Administrateur', email: 'admin@ecole.com', role: 'admin', telephone: '', actif: true },
  { _id: 'u2', nom: 'Directeur', email: 'directeur@ecole.com', role: 'directeur', telephone: '', actif: true },
  { _id: 'u3', nom: 'Enseignant', email: 'enseignant@ecole.com', role: 'enseignant', telephone: '', actif: true },
  { _id: 'u4', nom: 'Comptable', email: 'comptable@ecole.com', role: 'comptable', telephone: '', actif: true },
];

const usersPasswords = {
  'admin@ecole.com': 'admin123',
  'directeur@ecole.com': 'directeur123',
  'enseignant@ecole.com': 'enseignant123',
  'comptable@ecole.com': 'comptable123',
};

function generateToken() {
  return 'mock_token_' + Math.random().toString(36).substr(2);
}

let nextId = { s: 17, t: 9, c: 6, e: 6, p: 7, a: 10, u: 5 };

function paginate(arr, query) {
  const page = parseInt(query._page) || 1;
  const limit = parseInt(query._limit) || arr.length;
  const start = (page - 1) * limit;
  return arr.slice(start, start + limit);
}

function sortFilter(arr, req) {
  let result = [...arr];
  const { _sort, _order, _search, ...filters } = req.query;
  Object.entries(filters).forEach(([k, v]) => {
    if (k.startsWith('_')) return;
    if (typeof v === 'string') result = result.filter(item => String(item[k] || '').toLowerCase() === v.toLowerCase());
  });
  if (_sort) {
    result.sort((a, b) => {
      if (a[_sort] < b[_sort]) return _order === 'desc' ? 1 : -1;
      if (a[_sort] > b[_sort]) return _order === 'desc' ? -1 : 1;
      return 0;
    });
  }
  return result;
}

app.post('/api/auth/login', (req, res) => {
  const { email, motDePasse } = req.body;
  if (!usersPasswords[email] || usersPasswords[email] !== motDePasse) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  }
  const user = users.find(u => u.email === email);
  if (!user || !user.actif) return res.status(401).json({ message: 'Compte desactive' });
  const token = generateToken();
  res.json({ token, user: { id: user._id, nom: user.nom, email: user.email, role: user.role } });
});

app.get('/api/auth/me', (req, res) => {
  res.json(users[0]);
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalEleves: students.filter(s => s.actif).length,
    totalEnseignants: teachers.filter(t => t.actif).length,
    elevesPresentAujourdhui: attendances.filter(a => a.type === 'eleve' && a.statut === 'present').length,
    paiementsMois: { total: payments.reduce((s, p) => s + p.montant, 0), nombre: payments.length },
    classesStats: [
      { _id: 'Alif', count: students.filter(s => s.niveauCoranique === 'Alif').length },
      { _id: 'Ba', count: students.filter(s => s.niveauCoranique === 'Ba').length },
      { _id: 'Coran Debutant', count: students.filter(s => s.niveauCoranique === 'Coran Debutant').length },
      { _id: 'Memorisation', count: students.filter(s => s.niveauCoranique === 'Memorisation').length },
      { _id: 'Tajwid', count: students.filter(s => s.niveauCoranique === 'Tajwid').length },
    ]
  });
});

app.get('/api/students', (req, res) => {
  let result = sortFilter(students.filter(s => s.actif), req);
  if (req.query.niveau) result = result.filter(s => s.niveauCoranique === req.query.niveau);
  if (req.query.classe) result = result.filter(s => s.classe?._id === req.query.classe);
  res.json(result);
});

app.get('/api/students/:id', (req, res) => {
  const s = students.find(s => s._id === req.params.id);
  if (!s) return res.status(404).json({ message: 'Eleve non trouve' });
  res.json(s);
});

app.post('/api/students', (req, res) => {
  const s = { _id: String(nextId.s++), ...req.body, photo: req.file?.filename || '', dateInscription: new Date().toISOString(), actif: true, classe: null };
  students.push(s);
  res.status(201).json(s);
});

app.put('/api/students/:id', (req, res) => {
  const idx = students.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Eleve non trouve' });
  students[idx] = { ...students[idx], ...req.body, _id: req.params.id };
  res.json(students[idx]);
});

app.delete('/api/students/:id', (req, res) => {
  const idx = students.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Eleve non trouve' });
  students.splice(idx, 1);
  res.json({ message: 'Eleve supprime' });
});

app.get('/api/teachers', (req, res) => {
  let result = sortFilter(teachers.filter(t => t.actif), req);
  res.json(result);
});

app.get('/api/teachers/:id', (req, res) => {
  const t = teachers.find(t => t._id === req.params.id);
  if (!t) return res.status(404).json({ message: 'Enseignant non trouve' });
  res.json(t);
});

app.post('/api/teachers', (req, res) => {
  const t = { _id: String(nextId.t++), ...req.body, photo: req.file?.filename || '', dateEmbauche: new Date().toISOString(), actif: true };
  teachers.push(t);
  res.status(201).json(t);
});

app.put('/api/teachers/:id', (req, res) => {
  const idx = teachers.findIndex(t => t._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Enseignant non trouve' });
  teachers[idx] = { ...teachers[idx], ...req.body, _id: req.params.id };
  res.json(teachers[idx]);
});

app.delete('/api/teachers/:id', (req, res) => {
  const idx = teachers.findIndex(t => t._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Enseignant non trouve' });
  teachers.splice(idx, 1);
  res.json({ message: 'Enseignant supprime' });
});

app.get('/api/classes', (req, res) => {
  res.json(classes);
});

app.get('/api/classes/:id', (req, res) => {
  const c = classes.find(c => c._id === req.params.id);
  if (!c) return res.status(404).json({ message: 'Classe non trouvee' });
  res.json(c);
});

app.post('/api/classes', (req, res) => {
  const c = { _id: String(nextId.c++), ...req.body, nombreEleves: 0, actif: true };
  classes.push(c);
  res.status(201).json(c);
});

app.put('/api/classes/:id', (req, res) => {
  const idx = classes.findIndex(c => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Classe non trouvee' });
  classes[idx] = { ...classes[idx], ...req.body, _id: req.params.id };
  res.json(classes[idx]);
});

app.delete('/api/classes/:id', (req, res) => {
  const idx = classes.findIndex(c => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Classe non trouvee' });
  classes.splice(idx, 1);
  res.json({ message: 'Classe supprimee' });
});

app.get('/api/attendance', (req, res) => {
  let result = [...attendances];
  if (req.query.date) result = result.filter(a => a.date === req.query.date.split('T')[0]);
  if (req.query.type) result = result.filter(a => a.type === req.query.type);
  if (req.query.eleve) result = result.filter(a => a.eleve?._id === req.query.eleve);
  if (req.query.enseignant) result = result.filter(a => a.enseignant?._id === req.query.enseignant);
  res.json(result);
});

app.post('/api/attendance', (req, res) => {
  const { type, date, statut, eleveId, enseignantId } = req.body;
  const data = { _id: String(nextId.a++), type, date, statut };
  if (type === 'eleve') {
    const s = students.find(st => st._id === eleveId);
    data.eleve = s ? { _id: s._id, nom: s.nom, prenom: s.prenom } : { _id: eleveId, nom: '', prenom: '' };
  } else {
    const t = teachers.find(te => te._id === enseignantId);
    data.enseignant = t ? { _id: t._id, nom: t.nom, prenom: t.prenom } : { _id: enseignantId, nom: '', prenom: '' };
  }
  const existing = attendances.findIndex(a => {
    if (type === 'eleve') return a.date === date && a.eleve?._id === eleveId;
    return a.date === date && a.enseignant?._id === enseignantId;
  });
  if (existing >= 0) {
    attendances[existing] = { ...attendances[existing], ...data };
    return res.json(attendances[existing]);
  }
  attendances.push(data);
  res.status(201).json(data);
});

app.get('/api/payments', (req, res) => {
  let result = [...payments];
  if (req.query.eleve) result = result.filter(p => p.eleve?._id === req.query.eleve);
  if (req.query.type) result = result.filter(p => p.type === req.query.type);
  if (req.query.mois) result = result.filter(p => p.mois === req.query.mois);
  if (req.query.annee) result = result.filter(p => p.annee === parseInt(req.query.annee));
  res.json(result);
});

app.get('/api/payments/:id', (req, res) => {
  const p = payments.find(p => p._id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Paiement non trouve' });
  res.json(p);
});

app.post('/api/payments', (req, res) => {
  const p = { _id: String(nextId.p++), ...req.body, datePaiement: new Date().toISOString(), eleve: null };
  const s = students.find(st => st._id === req.body.eleve);
  if (s) p.eleve = { _id: s._id, nom: s.nom, prenom: s.prenom, nomTuteur: s.nomTuteur, contactParent: s.contactParent };
  payments.push(p);
  res.status(201).json(p);
});

app.put('/api/payments/:id', (req, res) => {
  const idx = payments.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Paiement non trouve' });
  payments[idx] = { ...payments[idx], ...req.body, _id: req.params.id };
  res.json(payments[idx]);
});

app.delete('/api/payments/:id', (req, res) => {
  const idx = payments.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Paiement non trouve' });
  payments.splice(idx, 1);
  res.json({ message: 'Paiement supprime' });
});

app.get('/api/payments/:id/recu', (req, res) => {
  const PDFDocument = require('pdfkit');
  const payment = payments.find(p => p._id === req.params.id);
  if (!payment) return res.status(404).json({ message: 'Paiement non trouve' });
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=recu-${payment._id}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).text('RECU DE PAIEMENT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  doc.text('Ecole Coranique - Gestion');
  doc.text(`Date: ${new Date(payment.datePaiement).toLocaleDateString('fr-FR')}`);
  doc.moveDown();
  if (payment.eleve) {
    doc.text(`Eleve: ${payment.eleve.nom} ${payment.eleve.prenom}`);
    doc.text(`Tuteur: ${payment.eleve.nomTuteur}`);
  }
  doc.moveDown();
  doc.text(`Type: ${payment.type}`);
  if (payment.mois) doc.text(`Mois: ${payment.mois}/${payment.annee}`);
  doc.text(`Montant: ${payment.montant.toLocaleString()} Fcfa`);
  doc.text(`Mode de paiement: ${payment.modePaiement}`);
  if (payment.reference) doc.text(`Reference: ${payment.reference}`);
  doc.moveDown();
  doc.text('Signature et cachet', { align: 'right' });
  doc.end();
});

app.get('/api/evaluations', (req, res) => {
  let result = [...evaluations];
  if (req.query.eleve) result = result.filter(e => e.eleve?._id === req.query.eleve);
  if (req.query.niveau) result = result.filter(e => e.niveau === req.query.niveau);
  result.sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation));
  res.json(result);
});

app.get('/api/evaluations/:id', (req, res) => {
  const e = evaluations.find(e => e._id === req.params.id);
  if (!e) return res.status(404).json({ message: 'Evaluation non trouvee' });
  res.json(e);
});

app.post('/api/evaluations', (req, res) => {
  const e = { _id: String(nextId.e++), ...req.body, dateEvaluation: new Date().toISOString(), eleve: null };
  const s = students.find(st => st._id === req.body.eleve);
  if (s) e.eleve = { _id: s._id, nom: s.nom, prenom: s.prenom };
  evaluations.push(e);
  res.status(201).json(e);
});

app.put('/api/evaluations/:id', (req, res) => {
  const idx = evaluations.findIndex(e => e._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Evaluation non trouvee' });
  evaluations[idx] = { ...evaluations[idx], ...req.body, _id: req.params.id };
  res.json(evaluations[idx]);
});

app.delete('/api/evaluations/:id', (req, res) => {
  const idx = evaluations.findIndex(e => e._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Evaluation non trouvee' });
  evaluations.splice(idx, 1);
  res.json({ message: 'Evaluation supprimee' });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const u = { _id: String(nextId.u++), ...req.body, actif: true };
  users.push(u);
  res.status(201).json({ id: u._id, nom: u.nom, email: u.email, role: u.role });
});

app.put('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Utilisateur non trouve' });
  users[idx] = { ...users[idx], ...req.body, _id: req.params.id };
  res.json(users[idx]);
});

app.delete('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Utilisateur non trouve' });
  users.splice(idx, 1);
  res.json({ message: 'Utilisateur supprime' });
});

app.get('/api/reports/eleves/pdf', (req, res) => {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 30 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=liste-eleves.pdf');
  doc.pipe(res);
  doc.fontSize(18).text('Liste des Eleves', { align: 'center' });
  doc.moveDown();
  students.filter(s => s.actif).forEach((s, i) => {
    doc.fontSize(11).text(`${i + 1}. ${s.nom} ${s.prenom} - ${s.niveauCoranique || 'N/A'} - Tuteur: ${s.nomTuteur} - Tel: ${s.contactParent}`);
  });
  doc.end();
});

app.get('/api/reports/eleves/excel', (req, res) => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Eleves');
  sheet.columns = [
    { header: 'Nom', key: 'nom', width: 20 }, { header: 'Prenom', key: 'prenom', width: 20 },
    { header: 'Niveau', key: 'niveau', width: 20 }, { header: 'Tuteur', key: 'tuteur', width: 25 },
    { header: 'Contact', key: 'contact', width: 20 }
  ];
  students.filter(s => s.actif).forEach(s => sheet.addRow({ nom: s.nom, prenom: s.prenom, niveau: s.niveauCoranique, tuteur: s.nomTuteur, contact: s.contactParent }));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=liste-eleves.xlsx');
  workbook.xlsx.write(res).then(() => res.end());
});

app.get('/api/reports/paiements/pdf', (req, res) => {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 30 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=rapport-paiements.pdf');
  doc.pipe(res);
  doc.fontSize(18).text('Rapport des Paiements', { align: 'center' });
  doc.moveDown();
  let total = 0;
  payments.forEach((p, i) => {
    doc.fontSize(11).text(`${i + 1}. ${p.eleve?.nom || 'N/A'} ${p.eleve?.prenom || ''} - ${p.type} - ${p.montant.toLocaleString()} Fcfa`);
    total += p.montant;
  });
  doc.moveDown().fontSize(14).text(`Total: ${total.toLocaleString()} Fcfa`, { align: 'right' });
  doc.end();
});

app.get('/api/reports/paiements/excel', (req, res) => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Paiements');
  sheet.columns = [
    { header: 'Eleve', key: 'eleve', width: 30 }, { header: 'Type', key: 'type', width: 15 },
    { header: 'Montant', key: 'montant', width: 15 }, { header: 'Date', key: 'date', width: 15 },
    { header: 'Mode', key: 'mode', width: 15 }
  ];
  payments.forEach(p => sheet.addRow({ eleve: `${p.eleve?.nom || ''} ${p.eleve?.prenom || ''}`, type: p.type, montant: p.montant, date: new Date(p.datePaiement).toLocaleDateString('fr-FR'), mode: p.modePaiement }));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=rapport-paiements.xlsx');
  workbook.xlsx.write(res).then(() => res.end());
});

app.get('/api/reports/presences/pdf', (req, res) => {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 30 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=rapport-presences.pdf');
  doc.pipe(res);
  doc.fontSize(18).text('Rapport des Presences', { align: 'center' });
  doc.moveDown();
  attendances.forEach((a, i) => {
    const nom = a.type === 'eleve' ? `${a.eleve?.nom || ''} ${a.eleve?.prenom || ''}` : `${a.enseignant?.nom || ''} ${a.enseignant?.prenom || ''}`;
    doc.fontSize(11).text(`${i + 1}. ${nom} - ${new Date(a.date).toLocaleDateString('fr-FR')} - ${a.statut}`);
  });
  doc.end();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Comptes de test:');
  console.log('  admin@ecole.com / admin123');
  console.log('  directeur@ecole.com / directeur123');
  console.log('  enseignant@ecole.com / enseignant123');
  console.log('  comptable@ecole.com / comptable123');
});
