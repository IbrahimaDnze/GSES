import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import Avatar from '../../components/Common/Avatar';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const EvaluationPage = () => {
  const { addToast } = useToast();
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('');
  const [filtreEleve, setFiltreEleve] = useState('');
  const [page, setPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState(null);
  const [matriculeInput, setMatriculeInput] = useState('');
  const [eleveTrouve, setEleveTrouve] = useState(null);
  const [form, setForm] = useState({
    eleve: '', sourate: '', noteRecitation: '', noteTajwid: ''
  });
  const [saving, setSaving] = useState(false);
  const perPage = 8;

  const fetchEvals = () => {
    setLoading(true);
    const params = {};
    if (filtreEleve) params.eleve = filtreEleve;
    Promise.all([
      api.get('/evaluations', { params }).then(r => r.data),
      api.get('/students').then(r => r.data),
    ]).then(([e, s]) => { setEvaluations(e); setStudents(s); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvals(); }, []);
  useEffect(() => { fetchEvals(); }, [filtreEleve]);

  useEffect(() => {
    api.get('/levels').then(r => setNiveaux(r.data.map(l => l.nom))).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return evaluations.filter(e => {
      const q = search.toLowerCase();
      if (search && !`${e.eleve?.nom || ''} ${e.eleve?.prenom || ''} ${e.sourate || ''}`.toLowerCase().includes(q)) return false;
      if (filtreNiveau && e.niveau !== filtreNiveau) return false;
      return true;
    });
  }, [evaluations, search, filtreNiveau]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => { setPage(1); }, [search, filtreNiveau, filtreEleve]);

  const chercherEleve = (q) => {
    setMatriculeInput(q);
    if (!q.trim()) { setEleveTrouve(null); setForm(f => ({ ...f, eleve: '' })); return; }
    const found = students.find(s =>
      s.matricule?.toLowerCase() === q.trim().toLowerCase() ||
      s._id === q.trim() ||
      `${s.nom} ${s.prenom}`.toLowerCase().includes(q.toLowerCase())
    );
    setEleveTrouve(found || null);
    setForm(f => ({ ...f, eleve: found ? found._id : '' }));
  };

  const openAdd = () => {
    setForm({ eleve: '', sourate: '', noteRecitation: '', noteTajwid: '' });
    setMatriculeInput(''); setEleveTrouve(null);
    setEditId(null); setShowDrawer(true);
  };

  const openEdit = (e) => {
    setForm({
      eleve: e.eleve?._id || '', sourate: e.sourate,
      noteRecitation: e.noteRecitation, noteTajwid: e.noteTajwid
    });
    const found = e.eleve?._id ? students.find(s => s._id === e.eleve._id) : null;
    setMatriculeInput(found ? `${found.nom} ${found.prenom}` : '');
    setEleveTrouve(found || null);
    setEditId(e._id); setShowDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await api.put(`/evaluations/${editId}`, form); addToast('Évaluation modifiée'); }
      else { await api.post('/evaluations', form); addToast('Évaluation ajoutée'); }
      setShowDrawer(false); fetchEvals();
    } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette évaluation ?')) {
      try { await api.delete(`/evaluations/${id}`); addToast('Évaluation supprimée'); fetchEvals(); } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); }
    }
  };

  const stats = useMemo(() => {
    const notes = evaluations.flatMap(e => [e.noteRecitation, e.noteTajwid]);
    return {
      total: evaluations.length,
      moyenne: notes.length > 0 ? (notes.reduce((s, n) => s + n, 0) / notes.length).toFixed(1) : '—',
      meilleur: notes.length > 0 ? Math.max(...notes) : '—',
      parNiveau: niveaux.reduce((acc, n) => ({ ...acc, [n]: evaluations.filter(e => e.niveau === n).length }), {}),
    };
  }, [evaluations]);

  const getNoteColor = (note) => {
    if (note >= 8) return '#059669';
    if (note >= 6) return '#d97706';
    if (note >= 5) return '#db2777';
    return '#dc2626';
  };

  return (
    <Layout>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 style={{ fontSize: 18, letterSpacing: 1, color: '#0a2e2a' }}>GESTION DES ÉVALUATIONS</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Nouvelle évaluation
          </button>
        </div>
      </div>

      <div className="stu-stats">
        <div className="stu-stat-card" style={{ borderTopColor: '#059669' }}>
          <div className="stu-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <i className="fa-solid fa-clipboard-list"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.total}</div>
            <div className="stu-stat-label">Évaluations</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#4f46e5' }}>
          <div className="stu-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.moyenne}/10</div>
            <div className="stu-stat-label">Moyenne générale</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#d97706' }}>
          <div className="stu-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.meilleur}/10</div>
            <div className="stu-stat-label">Meilleure note</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#db2777' }}>
          <div className="stu-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <div className="stu-stat-value">
              {niveaux.map(n => (
                <span key={n} className="badge" style={{ background: '#f1f0ed', color: '#57534e', fontSize: 10, padding: '1px 6px', margin: '0 1px' }}>{n.slice(0, 3)}: {stats.parNiveau[n] || 0}</span>
              ))}
            </div>
            <div className="stu-stat-label">Par niveau</div>
          </div>
        </div>
      </div>

      <div className="stu-filters">
        <div className="stu-filter-group">
          <i className="fa-solid fa-search"></i>
          <input placeholder="Rechercher par élève ou sourate..." value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 200 }} />
        </div>
        <div className="stu-filter-group">
          <select value={filtreNiveau} onChange={e => setFiltreNiveau(e.target.value)}>
            <option value="">Tous niveaux</option>
            {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="stu-filter-group">
          <select value={filtreEleve} onChange={e => setFiltreEleve(e.target.value)}>
            <option value="">Tous élèves</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.nom} {s.prenom}</option>)}
          </select>
        </div>
        {(search || filtreNiveau || filtreEleve) && (
          <button className="btn btn-sm" style={{ background: '#f1f0ed', color: '#57534e' }} onClick={() => { setSearch(''); setFiltreNiveau(''); setFiltreEleve(''); }}>
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
                  <th className="col-photo" style={{ width: 44 }}></th>
                  <th className="col-nom">Élève</th>
                  <th className="col-eval">Sourate</th>
                  <th className="col-montant">Récitation</th>
                  <th className="col-montant">Tajwid</th>
                  <th className="col-classe">Moyenne</th>
                  <th className="col-date">Date</th>
                  <th className="col-actions" style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(e => {
                  const moy = ((e.noteRecitation + e.noteTajwid) / 2).toFixed(1);
                  return (
                    <tr key={e._id}>
                      <td><Avatar nom={e.eleve?.nom} prenom={e.eleve?.prenom} photo={e.eleve?.photo} size={32} /></td>
                      <td style={{ fontWeight: 600, fontSize: 13.5 }}>{e.eleve?.nom} {e.eleve?.prenom}</td>
                      <td style={{ fontStyle: 'italic', color: '#0a2e2a' }}>{e.sourate}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: getNoteColor(e.noteRecitation) }}>
                          <i className="fa-solid fa-circle" style={{ fontSize: 6 }}></i>
                          {e.noteRecitation}/10
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: getNoteColor(e.noteTajwid) }}>
                          <i className="fa-solid fa-circle" style={{ fontSize: 6 }}></i>
                          {e.noteTajwid}/10
                        </span>
                      </td>
                      <td>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: `linear-gradient(135deg, ${getNoteColor(parseFloat(moy))}, ${getNoteColor(parseFloat(moy))}cc)`,
                          color: '#fff', fontWeight: 700, fontSize: 13,
                        }}>{moy}</div>
                      </td>

                      <td style={{ fontSize: 12.5, color: '#57534e' }}>
                        {new Date(e.dateEvaluation).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm" style={{ background: '#fffbeb', color: '#d97706', padding: '5px 9px' }} onClick={() => openEdit(e)} title="Modifier"><i className="fa-solid fa-pen"></i></button>
                          <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', padding: '5px 9px' }} onClick={() => handleDelete(e._id)} title="Supprimer"><i className="fa-solid fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <i className="fa-solid fa-file-circle-minus" style={{ fontSize: 28, marginBottom: 8, display: 'block' }}></i>
                    Aucune évaluation trouvée
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="stu-pagination">
            <div className="stu-pagination-info">
              Affichage {(page - 1) * perPage + 1} à {Math.min(page * perPage, filtered.length)} sur {filtered.length} évaluations
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
          <div style={{ position: 'fixed', top: 0, right: 0, width: 440, height: '100vh', background: '#fff', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f0ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0a2e2a', fontSize: 16 }}>
                <i className="fa-solid fa-clipboard-list" style={{ color: '#059669', marginRight: 8 }}></i>
                {editId ? "Modifier l'évaluation" : "Nouvelle évaluation"}
              </h3>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#78716c', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label>Matricule / Élève</label>
                <div className="matricule-search">
                  <i className="fa-solid fa-search"></i>
                  <input
                    placeholder="Entrer le matricule ou le nom..."
                    value={matriculeInput}
                    onChange={e => chercherEleve(e.target.value)}
                  />
                </div>
                {eleveTrouve && (
                  <div className="eleve-found">
                    <span className="eleve-found-badge">{eleveTrouve.matricule || `ETU-${eleveTrouve._id}`}</span>
                    <span className="eleve-found-name">{eleveTrouve.nom} {eleveTrouve.prenom}</span>
                    <span className="eleve-found-tuteur">{eleveTrouve.niveauCoranique}</span>
                  </div>
                )}
                {matriculeInput && !eleveTrouve && (
                  <div className="eleve-not-found">Aucun élève trouvé</div>
                )}
                <input type="hidden" name="eleve" value={form.eleve} />
              </div>
              <div className="form-group"><label>Sourate</label><input value={form.sourate} onChange={e => setForm({...form, sourate: e.target.value})} required /></div>
              <div className="form-row" style={{ gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}><label>Note Récitation /10</label><input type="number" min="0" max="10" step="0.5" value={form.noteRecitation} onChange={e => setForm({...form, noteRecitation: e.target.value})} required /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Note Tajwid /10</label><input type="number" min="0" max="10" step="0.5" value={form.noteTajwid} onChange={e => setForm({...form, noteTajwid: e.target.value})} required /></div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f0ed' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {editId ? 'Modifier' : 'Enregistrer'}
                </button>
                <button type="button" className="btn" onClick={() => setShowDrawer(false)} style={{ border: '1.5px solid #e5e7eb', color: '#57534e' }}>Annuler</button>
              </div>
            </form>
          </div>
        </>
      )}
    </Layout>
  );
};

export default EvaluationPage;
