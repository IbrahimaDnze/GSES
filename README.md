# Ecole Coranique - Application de Gestion

Application web pour la gestion d'une ecole coranique.

## Fonctionnalites

- Tableau de bord avec statistiques
- Gestion des eleves (CRUD + photo)
- Gestion des enseignants (CRUD + salaire)
- Gestion des classes (5 niveaux: Alif, Ba, Coran Debutant, Memorisation, Tajwid)
- Gestion des presences (eleves et enseignants)
- Gestion des paiements (inscription, mensualites, recus PDF)
- Evaluations coraniques (recitation, tajwid)
- Gestion des utilisateurs (4 roles: admin, directeur, enseignant, comptable)
- Rapports (PDF et Excel)

## Installation

### Backend

```bash
cd backend
npm install
```

Creer un fichier `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecole-coranique
JWT_SECRET=votre_secret_jwt
```

Lancer le seed (optionnel - cree des utilisateurs de test):
```bash
node seed.js
```

Demarrer le serveur:
```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Comptes de test

| Role | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@ecole.com | admin123 |
| Directeur | directeur@ecole.com | directeur123 |
| Enseignant | enseignant@ecole.com | enseignant123 |
| Comptable | comptable@ecole.com | comptable123 |

## Tech Stack

- **Frontend:** React 18, React Router 6, Axios
- **Backend:** Node.js, Express.js
- **Base de donnees:** MongoDB avec Mongoose
- **Export:** PDFKit (PDF), ExcelJS (Excel)
