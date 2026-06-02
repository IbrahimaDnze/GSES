import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import Avatar from '../../components/Common/Avatar';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const ClassList = () => {
  const { addToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [page, setPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMatiereDrawer, setShowMatiereDrawer] = useState(false);
  const [showNiveauDrawer, setShowNiveauDrawer] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nom: '', niveau: '', enseignant: '', description: '' });
  const [matiereForm, setMatiereForm] = useState({ nom: '' });
  const [niveauForm, setNiveauForm] = useState({ nom: '' });
  const [saving, setSaving] = useState(false);
  const perPage = 8;

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/classes').then(r => r.data),
      api.get('/teachers').then(r => r.data),
      api.get('/subjects').then(r => r.data),
      api.get('/levels').then(r => r.data),
    ]).then(([c, t, s, l]) => { setClasses(c); setTeachers(t); setMatieres(s); setNiveaux(l); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return classes.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.nom.toLowerCase().includes(q) && !(c.enseignant?.nom?.toLowerCase().includes(q)) && !(c.enseignant?.prenom?.toLowerCase().includes(q))) return false;
      }
      if (filtreNiveau && c.niveau !== filtreNiveau) return false;
      if (filtreStatut === 'actif' && !c.actif) return false;
      if (filtreStatut === 'inactif' && c.actif) return false;
      return true;
    });
  }, [classes, search, filtreNiveau, filtreStatut]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [search, filtreNiveau, filtreStatut]);

  const openAdd = () => { setForm({ nom: '', niveau: niveaux[0]?.nom || '', enseignant: '', description: '' }); setEditId(null); setShowDrawer(true); };
  const openEdit = (c) => { setForm({ nom: c.nom, niveau: c.niveau, enseignant: c.enseignant?._id || '', description: c.description || '' }); setEditId(c._id); setShowDrawer(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await api.put(`/classes/${editId}`, form); addToast('Classe modifiée'); }
      else { await api.post('/classes', form); addToast('Classe créée'); }
      setShowDrawer(false); fetchData();
    } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette classe ?')) {
      try { await api.delete(`/classes/${id}`); addToast('Classe supprimée'); fetchData(); } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); }
    }
  };

  const stats = useMemo(() => ({
    total: classes.length,
    actives: classes.filter(c => c.actif !== false).length,
    totalEleves: classes.reduce((sum, c) => sum + (c.nombreEleves || 0), 0),
    niveauxUniques: new Set(classes.map(c => c.niveau)).size,
  }), [classes]);

  return (
    <Layout>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 style={{ fontSize: 18, letterSpacing: 1, color: '#0a2e2a' }}>GESTION DES CLASSES</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-info" onClick={() => { setMatiereForm({ nom: '' }); setShowMatiereDrawer(true); }}>
            <i className="fa-solid fa-book-open"></i> Ajouter une matière
          </button>
          <button className="btn" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff' }} onClick={() => { setNiveauForm({ nom: '' }); setShowNiveauDrawer(true); }}>
            <i className="fa-solid fa-layer-group"></i> Ajouter un niveau
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Ajouter une classe
          </button>
          <button className="btn btn-success">
            <i className="fa-solid fa-file-export"></i> Exporter
          </button>
        </div>
      </div>

      <div className="stu-stats">
        <div className="stu-stat-card" style={{ borderTopColor: '#059669' }}>
          <div className="stu-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <i className="fa-solid fa-school"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.total}</div>
            <div className="stu-stat-label">Total classes</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#4f46e5' }}>
          <div className="stu-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <i className="fa-solid fa-toggle-on"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.actives}</div>
            <div className="stu-stat-label">Classes actives</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#d97706' }}>
          <div className="stu-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.totalEleves}</div>
            <div className="stu-stat-label">Élèves inscrits</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#db2777' }}>
          <div className="stu-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.niveauxUniques}</div>
            <div className="stu-stat-label">Niveaux distincts</div>
          </div>
        </div>
      </div>

      <div className="stu-filters">
        <div className="stu-filter-group">
          <i className="fa-solid fa-search"></i>
          <input placeholder="Rechercher une classe ou un enseignant..." value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 220 }} />
        </div>
        <div className="stu-filter-group">
          <select value={filtreNiveau} onChange={e => setFiltreNiveau(e.target.value)}>
            <option value="">Tous niveaux</option>
            {niveaux.map(n => <option key={n._id} value={n.nom}>{n.nom}</option>)}
          </select>
        </div>
        <div className="stu-filter-group">
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
            <option value="">Tous statuts</option>
            <option value="actif">Active</option>
            <option value="inactif">Inactive</option>
          </select>
        </div>
        {(search || filtreNiveau || filtreStatut) && (
          <button className="btn btn-sm" style={{ background: '#f1f0ed', color: '#57534e' }} onClick={() => { setSearch(''); setFiltreNiveau(''); setFiltreStatut(''); }}>
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
                  <th className="col-nom">Nom de la classe</th>
                  <th className="col-niveau">Niveau</th>
                  <th className="col-contact">Enseignant</th>
                  <th className="col-classe">Élèves</th>
                  <th className="col-statut">Statut</th>
                  <th className="col-actions" style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(c => {
                  return (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>{c.nom}</td>
                      <td>
                        <span className="badge" style={{ background: c.niveau === 'Alif' ? '#059669' : c.niveau === 'Ba' ? '#4f46e5' : c.niveau === 'Memorisation' ? '#d97706' : '#0891b2' }}>
                          {c.niveau}
                        </span>
                      </td>
                      <td>
                        {c.enseignant ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar nom={c.enseignant.nom} prenom={c.enseignant.prenom} photo={c.enseignant.photo} size={28} />
                            <span style={{ fontSize: 13 }}>{c.enseignant.prenom} {c.enseignant.nom}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: 13 }}>Non assigné</span>
                        )}
                      </td>
                      <td style={{ fontSize: 14, fontWeight: 600, color: '#0a2e2a' }}>
                        <i className="fa-solid fa-user-graduate" style={{ color: '#059669', marginRight: 4, fontSize: 12 }}></i>
                        {c.nombreEleves || 0}
                      </td>
                      <td><span className={`badge ${c.actif !== false ? 'badge-present' : 'badge-absent'}`}>{c.actif !== false ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm" style={{ background: '#eef2ff', color: '#4f46e5', padding: '5px 9px' }} onClick={() => openEdit(c)} title="Modifier"><i className="fa-solid fa-pen"></i></button>
                          <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', padding: '5px 9px' }} onClick={() => handleDelete(c._id)} title="Supprimer"><i className="fa-solid fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <i className="fa-solid fa-chalkboard-slash" style={{ fontSize: 28, marginBottom: 8, display: 'block' }}></i>
                    Aucune classe trouvée
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="stu-pagination">
            <div className="stu-pagination-info">
              Affichage {(page - 1) * perPage + 1} à {Math.min(page * perPage, filtered.length)} sur {filtered.length} classes
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
                return <button key={p} className={`stu-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
              })}
              <button className="stu-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </>
      )}

      {showDrawer && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} onClick={() => setShowDrawer(false)} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', background: '#fff', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f0ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0a2e2a', fontSize: 16 }}>
                <i className="fa-solid fa-school" style={{ color: '#059669', marginRight: 8 }}></i>
                {editId ? 'Modifier la classe' : 'Nouvelle classe'}
              </h3>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#78716c', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label>Nom de la classe</label><input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required /></div>
              <div className="form-group"><label>Niveau</label>
                <select value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})}>
                  {niveaux.map(n => <option key={n._id} value={n.nom}>{n.nom}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Enseignant</label>
                <select value={form.enseignant} onChange={e => setForm({...form, enseignant: e.target.value})}>
                  <option value="">Non assigné</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.prenom} {t.nom}</option>)}
                </select>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f0ed' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {editId ? 'Modifier' : 'Ajouter'}
                </button>
                <button type="button" className="btn" onClick={() => setShowDrawer(false)} style={{ border: '1.5px solid #e5e7eb', color: '#57534e' }}>Annuler</button>
              </div>
            </form>
          </div>
        </>
      )}

      {showMatiereDrawer && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} onClick={() => setShowMatiereDrawer(false)} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', background: '#fff', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f0ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0a2e2a', fontSize: 16 }}>
                <i className="fa-solid fa-book-open" style={{ color: '#0891b2', marginRight: 8 }}></i> Nouvelle matière
              </h3>
              <button onClick={() => setShowMatiereDrawer(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#78716c', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (!matiereForm.nom.trim()) return; try { await api.post('/subjects', { nom: matiereForm.nom.trim() }); addToast('Matière ajoutée'); fetchData(); setShowMatiereDrawer(false); } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); } }} style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label>Nom de la matière</label><input value={matiereForm.nom} onChange={e => setMatiereForm({...matiereForm, nom: e.target.value})} required placeholder="Ex: Tafsir" /></div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f0ed' }}>
                <button type="submit" className="btn btn-info"><i className="fa-solid fa-save"></i> Ajouter</button>
                <button type="button" className="btn" onClick={() => setShowMatiereDrawer(false)} style={{ border: '1.5px solid #e5e7eb', color: '#57534e' }}>Annuler</button>
              </div>
            </form>
          </div>
        </>
      )}

      {showNiveauDrawer && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} onClick={() => setShowNiveauDrawer(false)} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', background: '#fff', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f0ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0a2e2a', fontSize: 16 }}>
                <i className="fa-solid fa-layer-group" style={{ color: '#7c3aed', marginRight: 8 }}></i> Nouveau niveau
              </h3>
              <button onClick={() => setShowNiveauDrawer(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#78716c', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (!niveauForm.nom.trim()) return; try { await api.post('/levels', { nom: niveauForm.nom.trim() }); addToast('Niveau ajouté'); fetchData(); setShowNiveauDrawer(false); } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); } }} style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label>Nom du niveau</label><input value={niveauForm.nom} onChange={e => setNiveauForm({nom: e.target.value})} required placeholder="Ex: Juz 30" /></div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f0ed' }}>
                <button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff' }}><i className="fa-solid fa-save"></i> Ajouter</button>
                <button type="button" className="btn" onClick={() => setShowNiveauDrawer(false)} style={{ border: '1.5px solid #e5e7eb', color: '#57534e' }}>Annuler</button>
              </div>
            </form>
          </div>
        </>
      )}
    </Layout>
  );
};

export default ClassList;
