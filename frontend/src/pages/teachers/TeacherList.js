import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import Avatar from '../../components/Common/Avatar';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const TeacherList = () => {
  const { addToast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreMatiere, setFiltreMatiere] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreAnciennete, setFiltreAnciennete] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const fetchTeachers = () => {
    setLoading(true);
    api.get('/teachers').then(res => setTeachers(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTeachers(); }, []);

  const matieres = [...new Set(teachers.map(t => t.matiere).filter(Boolean))];

  const filtered = useMemo(() => {
    return teachers.filter(t => {
      const name = `${t.nom} ${t.prenom} ${t.email} ${t.telephone}`.toLowerCase();
      if (search && !name.includes(search.toLowerCase())) return false;
      if (filtreMatiere && t.matiere !== filtreMatiere) return false;
      if (filtreStatut === 'actif' && !t.actif) return false;
      if (filtreStatut === 'inactif' && t.actif) return false;
      if (filtreAnciennete) {
        const now = new Date();
        const embauche = new Date(t.dateEmbauche);
        const months = (now.getFullYear() - embauche.getFullYear()) * 12 + now.getMonth() - embauche.getMonth();
        if (filtreAnciennete === 'moins1' && months >= 12) return false;
        if (filtreAnciennete === '1a3' && (months < 12 || months > 36)) return false;
        if (filtreAnciennete === 'plus3' && months <= 36) return false;
      }
      return true;
    });
  }, [teachers, search, filtreMatiere, filtreStatut, filtreAnciennete]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filtreMatiere, filtreStatut, filtreAnciennete]);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet enseignant ?')) {
      try { await api.delete(`/teachers/${id}`); addToast('Enseignant supprimé'); fetchTeachers(); } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); }
    }
  };

  const genererCarte = async (id, nom) => {
    try {
      const r = await api.post('/cards', { type: 'enseignant', ids: [id] }, { responseType: 'blob' });
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
      const r = await api.get('/teachers/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'enseignants.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addToast('Erreur lors de l\'export PDF', 'error');
    }
  };

  const getTeacherId = (t) => t.identifiant || `ENS-${String(t._id).replace('t', '').padStart(3, '0')}`;

  const stats = useMemo(() => ({
    total: teachers.length,
    actifs: teachers.filter(t => t.actif).length,
    matieres: matieres.length,
    classes: [...new Set(teachers.flatMap(t => t.classes || []))].length,
  }), [teachers, matieres]);

  const badgeMatiere = (m) => {
    const colors = {
      'Coran': '#059669', 'Tajwid': '#4f46e5', 'Fiqh': '#d97706',
      'Hadith': '#db2777', 'Tafsir': '#0891b2', 'Aqida': '#7c3aed',
      'Langue Arabe': '#ca8a04',
    };
    return { background: `${colors[m] || '#059669'}15`, color: colors[m] || '#059669' };
  };

  return (
    <Layout>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 style={{ fontSize: 18, letterSpacing: 1, color: '#0a2e2a' }}>GESTION DES ENSEIGNANTS</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/enseignants/ajouter" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> Ajouter enseignant
          </Link>
          <button className="btn btn-success" onClick={handleExport}>
            <i className="fa-solid fa-file-export"></i> Exporter
          </button>
        </div>
      </div>

      <div className="stu-stats">
        <div className="stu-stat-card" style={{ borderTopColor: '#059669' }}>
          <div className="stu-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <i className="fa-solid fa-chalkboard-user"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.total}</div>
            <div className="stu-stat-label">Total enseignants</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#4f46e5' }}>
          <div className="stu-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <i className="fa-solid fa-user-check"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.actifs}</div>
            <div className="stu-stat-label">Enseignants actifs</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#d97706' }}>
          <div className="stu-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <i className="fa-solid fa-book-open"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.matieres}</div>
            <div className="stu-stat-label">Matières enseignées</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#db2777' }}>
          <div className="stu-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <i className="fa-solid fa-school"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.classes}</div>
            <div className="stu-stat-label">Classes attribuées</div>
          </div>
        </div>
      </div>

      <div className="stu-filters">
        <div className="stu-filter-group">
          <i className="fa-solid fa-search"></i>
          <input placeholder="Rechercher un enseignant..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="stu-filter-group">
          <select value={filtreMatiere} onChange={e => setFiltreMatiere(e.target.value)}>
            <option value="">Toutes matières</option>
            {matieres.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="stu-filter-group">
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
            <option value="">Tous statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
        <div className="stu-filter-group">
          <select value={filtreAnciennete} onChange={e => setFiltreAnciennete(e.target.value)}>
            <option value="">Toute ancienneté</option>
            <option value="moins1">Moins d'1 an</option>
            <option value="1a3">1 à 3 ans</option>
            <option value="plus3">Plus de 3 ans</option>
          </select>
        </div>
        {(search || filtreMatiere || filtreStatut || filtreAnciennete) && (
          <button className="btn btn-sm" style={{ background: '#f1f0ed', color: '#57534e' }} onClick={() => { setSearch(''); setFiltreMatiere(''); setFiltreStatut(''); setFiltreAnciennete(''); }}>
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
                  <th className="col-id">ID Enseignant</th>
                  <th className="col-contact">Téléphone</th>
                  <th className="col-matiere">Matière</th>
                  <th className="col-classe">Classes</th>
                  <th className="col-date">Date embauche</th>
                  <th className="col-statut">Statut</th>
                  <th className="col-actions" style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(t => (
                  <tr key={t._id}>
                    <td><Avatar nom={t.nom} prenom={t.prenom} photo={t.photo} size={36} /></td>
                    <td style={{ fontWeight: 600 }}>{t.nom} {t.prenom}</td>
                    <td style={{ color: '#78716c', fontFamily: 'monospace', fontSize: 12 }}>{getTeacherId(t)}</td>
                    <td style={{ fontSize: 12.5 }}>{t.telephone}</td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, ...badgeMatiere(t.matiere) }}>
                        {t.matiere || '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: '#57534e' }}>
                      {t.classes?.length > 0 ? t.classes.join(', ') : <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12.5, color: '#57534e' }}>
                      {new Date(t.dateEmbauche).toLocaleDateString('fr-FR')}
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                        {(() => {
                          const m = Math.floor((new Date() - new Date(t.dateEmbauche)) / (1000 * 60 * 60 * 24 * 30));
                          return m >= 12 ? `${Math.floor(m / 12)} ans` : `${m} mois`;
                        })()}
                      </div>
                    </td>
                    <td><span className={`badge ${t.actif ? 'badge-present' : 'badge-absent'}`}>{t.actif ? 'Actif' : 'Inactif'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm" style={{ background: '#eef2ff', color: '#4f46e5', padding: '5px 9px' }} title="Voir profil"><i className="fa-solid fa-user"></i></button>
                        <Link to={`/enseignants/modifier/${t._id}`} className="btn btn-sm" style={{ background: '#fffbeb', color: '#d97706', padding: '5px 9px' }} title="Modifier"><i className="fa-solid fa-pen"></i></Link>
                        <button className="btn btn-sm" style={{ background: '#f0fdf4', color: '#16a34a', padding: '5px 9px' }} onClick={() => genererCarte(t._id, `${t.nom}_${t.prenom}`)} title="Carte"><i className="fa-solid fa-id-card"></i></button>
                        <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', padding: '5px 9px' }} onClick={() => handleDelete(t._id)} title="Supprimer"><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <i className="fa-solid fa-chalkboard-user-slash" style={{ fontSize: 28, marginBottom: 8, display: 'block' }}></i>
                    Aucun enseignant trouvé
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="stu-pagination">
            <div className="stu-pagination-info">
              Affichage {(page - 1) * perPage + 1} à {Math.min(page * perPage, filtered.length)} sur {filtered.length} enseignants
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
                  <button key={p} className={`stu-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
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

export default TeacherList;
