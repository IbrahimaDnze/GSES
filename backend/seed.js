const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Level = require('./models/Level');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Teacher.deleteMany({});
  await Class.deleteMany({});
  await Subject.deleteMany({});
  await Level.deleteMany({});

  await User.create([
    { nom: 'Administrateur', email: 'admin@ecole.com', motDePasse: 'admin123', role: 'admin' },
    { nom: 'Directeur', email: 'directeur@ecole.com', motDePasse: 'directeur123', role: 'directeur' },
    { nom: 'Enseignant', email: 'enseignant@ecole.com', motDePasse: 'enseignant123', role: 'enseignant' },
    { nom: 'Comptable', email: 'comptable@ecole.com', motDePasse: 'comptable123', role: 'comptable' },
  ]);

  const teacher = await Teacher.create({
    nom: 'Ali', prenom: 'Hassan', email: 'ali@ecole.com',
    telephone: '7700112233', specialite: 'Tajwid', salaire: 200000
  });

  await Class.create([
    { nom: 'Alif - Section A', niveau: 'Alif', enseignant: teacher._id },
    { nom: 'Ba - Section A', niveau: 'Ba' },
    { nom: 'Coran Debutant', niveau: 'Coran Debutant' },
    { nom: 'Memorisation', niveau: 'Memorisation' },
    { nom: 'Tajwid Avance', niveau: 'Tajwid' },
  ]);

  await Subject.create([
    { nom: 'Coran' }, { nom: 'Tajwid' }, { nom: 'Fiqh' },
    { nom: 'Hadith' }, { nom: 'Tafsir' }, { nom: 'Aqida' }, { nom: 'Langue Arabe' },
  ]);

  await Level.create([
    { nom: 'Alif' }, { nom: 'Ba' }, { nom: 'Coran Debutant' },
    { nom: 'Memorisation' }, { nom: 'Tajwid' },
  ]);

  console.log('Donnees initiales inserees avec succes !');
  console.log('Admin: admin@ecole.com / admin123');
  console.log('Directeur: directeur@ecole.com / directeur123');
  console.log('Enseignant: enseignant@ecole.com / enseignant123');
  console.log('Comptable: comptable@ecole.com / comptable123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
