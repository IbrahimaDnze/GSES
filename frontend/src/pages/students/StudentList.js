import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import Avatar from '../../components/Common/Avatar';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const StudentList = () => {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNom, setSearchNom] = useState('');
  const [searchMatricule, setSearchMatricule] = useState('');
  const [filtreClasse, setFiltreClasse] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchStudents = () => {
    setLoading(true);
    const params = {};
    if (filtreNiveau) params.niveau = filtreNiveau;
    api.get('/students', { params })
      .then(res => setStudents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [filtreNiveau]);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const fullName = `${s.nom} ${s.prenom}`.toLowerCase();
      const mat = (s.matricule || `ETU-${String(s._id).padStart(4, '0')}`).toLowerCase();
      if (searchNom && !fullName.includes(searchNom.toLowerCase())) return false;
      if (searchMatricule && !mat.includes(searchMatricule.toLowerCase())) return false;
      if (filtreClasse && s.classe !== filtreClasse) return false;
      if (filtreStatut === 'actif' && !s.actif) return false;
      if (filtreStatut === 'inactif' && s.actif) return false;
      return true;
    });
  }, [students, searchNom, searchMatricule, filtreClasse, filtreStatut]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [searchNom, searchMatricule, filtreClasse, filtreNiveau, filtreStatut]);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet élève ?')) {
      try { await api.delete(`/students/${id}`); addToast('Élève supprimé'); fetchStudents(); } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); }
    }
  };

  const genererCarte = async (id, nom) => {
    try {
      const r = await api.post('/cards', { type: 'eleve', ids: [id] }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carte-${nom}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addToast('Erreur lors de la génération de la carte', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (filtreNiveau) params.niveau = filtreNiveau;
      const r = await api.get('/students/export/pdf', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'eleves.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addToast('Erreur lors de l\'export PDF', 'error');
    }
  };

  const getMatricule = (s) => s.matricule || `ETU-${String(s._id).padStart(4, '0')}`;

  const stats = useMemo(() => ({
    total: students.length,
    garcons: students.filter(s => s.sexe === 'garcon').length,
    filles: students.filter(s => s.sexe === 'fille').length,
    nouveaux: students.filter(s => new Date(s.dateInscription) > new Date('2025-06-01')).length,
  }), [students]);

  const classes = [...new Set(students.map(s => s.classe).filter(Boolean))];

  return (
    <Layout>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 style={{ fontSize: 18, letterSpacing: 1, color: '#0a2e2a' }}>GESTION DES ÉLÈVES</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/eleves/ajouter" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> Ajouter un élève
          </Link>
          <button className="btn btn-success" onClick={handleExport}>
            <i className="fa-solid fa-file-export"></i> Exporter
          </button>
        </div>
      </div>

      <div className="stu-stats">
        <div className="stu-stat-card" style={{ borderTopColor: '#059669' }}>
          <div className="stu-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.total}</div>
            <div className="stu-stat-label">Total élèves</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#4f46e5' }}>
          <div className="stu-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <i className="fa-solid fa-mars"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.garcons}</div>
            <div className="stu-stat-label">Garçons</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#db2777' }}>
          <div className="stu-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <i className="fa-solid fa-venus"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.filles}</div>
            <div className="stu-stat-label">Filles</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#d97706' }}>
          <div className="stu-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.nouveaux}</div>
            <div className="stu-stat-label">Nouveaux inscrits</div>
          </div>
        </div>
      </div>

      <div className="stu-filters">
        <div className="stu-filter-group">
          <i className="fa-solid fa-search"></i>
          <input placeholder="Rechercher par nom..." value={searchNom} onChange={e => setSearchNom(e.target.value)} />
        </div>
        <div className="stu-filter-group">
          <i className="fa-solid fa-id-card"></i>
          <input placeholder="Matricule..." value={searchMatricule} onChange={e => setSearchMatricule(e.target.value)} />
        </div>
        <div className="stu-filter-group">
          <select value={filtreClasse} onChange={e => setFiltreClasse(e.target.value)}>
            <option value="">Toutes les classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="stu-filter-group">
          <select value={filtreNiveau} onChange={e => setFiltreNiveau(e.target.value)}>
            <option value="">Tous niveaux</option>
            <option value="Alif">Alif</option>
            <option value="Ba">Ba</option>
            <option value="Coran Debutant">Coran Débutant</option>
            <option value="Memorisation">Mémorisation</option>
            <option value="Tajwid">Tajwid</option>
          </select>
        </div>
        <div className="stu-filter-group">
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
            <option value="">Tous statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
        {(searchNom || searchMatricule || filtreClasse || filtreNiveau || filtreStatut) && (
          <button className="btn btn-sm" style={{ background: '#f1f0ed', color: '#57534e' }} onClick={() => { setSearchNom(''); setSearchMatricule(''); setFiltreClasse(''); setFiltreNiveau(''); setFiltreStatut(''); }}>
            <i className="fa-solid fa-rotate"></i> Réinitialiser
          </button>
        )}
      </div>

      {loading ? <Loading /> : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="col-photo" style={{ width: 50 }}>Photo</th>
                  <th className="col-nom">Nom complet</th>
                  <th className="col-id">Matricule</th>
                  <th className="col-classe">Classe</th>
                  <th className="col-niveau">Niveau</th>
                  <th className="col-date">Date naissance</th>
                  <th className="col-contact">Parent / Tuteur</th>
                  <th className="col-contact">Téléphone</th>
                  <th className="col-statut">Statut</th>
                  <th className="col-actions" style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(s => (
                  <tr key={s._id}>
                    <td><Avatar nom={s.nom} prenom={s.prenom} photo={s.photo} size={36} /></td>
                    <td style={{ fontWeight: 600 }}>{s.nom} {s.prenom}</td>
                    <td style={{ color: '#78716c', fontFamily: 'monospace', fontSize: 12 }}>{getMatricule(s)}</td>
                    <td>{s.classe || <span style={{ color: '#9ca3af' }}>—</span>}</td>
                    <td><span className="badge badge-present">{s.niveauCoranique}</span></td>
                    <td style={{ fontSize: 12.5, color: '#57534e' }}>{s.dateNaissance ? new Date(s.dateNaissance).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={{ fontWeight: 500 }}>{s.nomTuteur}</td>
                    <td style={{ fontSize: 12.5 }}>{s.contactParent}</td>
                    <td><span className={`badge ${s.actif ? 'badge-present' : 'badge-absent'}`}>{s.actif ? 'Actif' : 'Inactif'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to={`/eleves/${s._id}`} className="btn btn-sm" style={{ background: '#eef2ff', color: '#4f46e5', padding: '5px 9px' }} title="Voir"><i className="fa-solid fa-eye"></i></Link>
                        <Link to={`/eleves/modifier/${s._id}`} className="btn btn-sm" style={{ background: '#fffbeb', color: '#d97706', padding: '5px 9px' }} title="Modifier"><i className="fa-solid fa-pen"></i></Link>
                        <button className="btn btn-sm" style={{ background: '#f0fdf4', color: '#16a34a', padding: '5px 9px' }} onClick={() => genererCarte(s._id, `${s.nom}_${s.prenom}`)} title="Carte"><i className="fa-solid fa-id-card"></i></button>
                        <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', padding: '5px 9px' }} onClick={() => handleDelete(s._id)} title="Supprimer"><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <i className="fa-solid fa-users-slash" style={{ fontSize: 28, marginBottom: 8, display: 'block' }}></i>
                    Aucun élève trouvé
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="stu-pagination">
            <div className="stu-pagination-info">
              Affichage {(page - 1) * perPage + 1} à {Math.min(page * perPage, filtered.length)} sur {filtered.length} élèves
            </div>
            <div className="stu-pagination-controls">
              <button className="stu-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let start = Math.max(1, page - 2);
                if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    className={`stu-page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button className="stu-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default StudentList;
