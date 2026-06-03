import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import Avatar from '../../components/Common/Avatar';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const TYPES_PAIEMENT = { inscription: 'Inscription', mensualite: 'Mensualité', autre: 'Autre' };
const MODES_PAIEMENT = { especes: 'Espèces', cheque: 'Chèque', virement: 'Virement', autre: 'Autre' };

const PaymentList = () => {
  const { addToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [impayes, setImpayes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImpayes, setShowImpayes] = useState(false);
  const [search, setSearch] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [filtreMode, setFiltreMode] = useState('');
  const [filtreMois, setFiltreMois] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [page, setPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState(null);
  const [matriculeInput, setMatriculeInput] = useState('');
  const [eleveTrouve, setEleveTrouve] = useState(null);
  const [form, setForm] = useState({
    eleve: '', type: 'mensualite', montant: '',
    mois: String(new Date().getMonth() + 1).padStart(2, '0'), annee: new Date().getFullYear(),
    modePaiement: 'especes', reference: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const perPage = 8;

  const fetchPayments = () => {
    setLoading(true);
    const params = {};
    if (filtreMois) params.mois = filtreMois;
    if (filtreAnnee) params.annee = filtreAnnee;
    Promise.all([
      api.get('/payments', { params }).then(r => r.data),
      api.get('/students').then(r => r.data),
      api.get('/payments/impayes', { params }).then(r => r.data),
    ]).then(([p, s, i]) => { setPayments(p); setStudents(s); setImpayes(i); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  useEffect(() => { fetchPayments(); }, [filtreMois, filtreAnnee]);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const q = search.toLowerCase();
      if (search && !`${p.eleve?.nom || ''} ${p.eleve?.prenom || ''} ${p.eleve?.nomTuteur || ''} ${p.reference || ''}`.toLowerCase().includes(q)) return false;
      if (filtreType && p.type !== filtreType) return false;
      if (filtreMode && p.modePaiement !== filtreMode) return false;
      return true;
    });
  }, [payments, search, filtreType, filtreMode]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => { setPage(1); }, [search, filtreType, filtreMode]);

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
    setForm({ eleve: '', type: 'mensualite', montant: '', mois: String(new Date().getMonth() + 1).padStart(2, '0'), annee: new Date().getFullYear(), modePaiement: 'especes', reference: '' });
    setMatriculeInput(''); setEleveTrouve(null);
    setEditId(null); setError(''); setShowDrawer(true);
  };

  const openEdit = (p) => {
    setForm({
      eleve: p.eleve?._id || '', type: p.type, montant: p.montant,
      mois: p.mois || '', annee: p.annee || new Date().getFullYear(),
      modePaiement: p.modePaiement, reference: p.reference || ''
    });
    const found = p.eleve?._id ? students.find(s => s._id === p.eleve._id) : null;
    setMatriculeInput(found ? `${found.nom} ${found.prenom}` : '');
    setEleveTrouve(found || null);
    setEditId(p._id); setError(''); setShowDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editId) { await api.put(`/payments/${editId}`, form); addToast('Paiement modifié'); }
      else { await api.post('/payments', form); addToast('Paiement ajouté'); }
      setShowDrawer(false); fetchPayments();
    } catch (err) { setError(err.response?.data?.message || 'Erreur'); addToast(err.response?.data?.message || 'Erreur', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce paiement ?')) {
      try { await api.delete(`/payments/${id}`); addToast('Paiement supprimé'); fetchPayments(); } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); }
    }
  };

  const downloadReceipt = async (id) => {
    try {
      const res = await api.get(`/payments/${id}/recu`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `recu-${id}.pdf`; a.click();
    } catch (err) { addToast('Erreur de téléchargement', 'error'); }
  };

  const stats = useMemo(() => ({
    total: payments.length,
    totalMontant: payments.reduce((s, p) => s + p.montant, 0),
    mensualites: payments.filter(p => p.type === 'mensualite').length,
    inscriptions: payments.filter(p => p.type === 'inscription').length,
  }), [payments]);

  const badgeType = (t) => {
    const m = { inscription: { bg: '#eef2ff', color: '#4f46e5' }, mensualite: { bg: '#ecfdf5', color: '#059669' }, autre: { bg: '#f5f5f4', color: '#78716c' } };
    return m[t] || m.autre;
  };

  return (
    <Layout>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 style={{ fontSize: 18, letterSpacing: 1, color: '#0a2e2a' }}>GESTION DES PAIEMENTS</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Nouveau paiement
          </button>
        </div>
      </div>

      <div className="stu-stats">
        <div className="stu-stat-card" style={{ borderTopColor: '#059669' }}>
          <div className="stu-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <i className="fa-solid fa-coins"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.totalMontant.toLocaleString()} F</div>
            <div className="stu-stat-label">Total encaissé</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#4f46e5' }}>
          <div className="stu-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <i className="fa-solid fa-receipt"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.total}</div>
            <div className="stu-stat-label">Transactions</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#d97706' }}>
          <div className="stu-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.mensualites}</div>
            <div className="stu-stat-label">Mensualités</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#db2777' }}>
          <div className="stu-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <i className="fa-solid fa-file-lines"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.inscriptions}</div>
            <div className="stu-stat-label">Inscriptions</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#dc2626', cursor: 'pointer' }} onClick={() => setShowImpayes(!showImpayes)}>
          <div className="stu-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <div className="stu-stat-value" style={{ color: '#dc2626' }}>{impayes.length}</div>
            <div className="stu-stat-label">Impayés <span style={{ fontWeight: 400, fontSize: 11 }}>({filtreMois ? MOIS[parseInt(filtreMois)-1] : MOIS[new Date().getMonth()]} {filtreAnnee || new Date().getFullYear()})</span></div>
          </div>
        </div>
      </div>

      {showImpayes && (
        <div style={{ marginBottom: 20, background: '#fff', borderRadius: 14, border: '1px solid #fecaca', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 20px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#b91c1c' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }}></i>
              {impayes.length} élève{impayes.length > 1 ? 's' : ''} n'ayant pas payé
            </span>
            <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 10px', fontSize: 12 }} onClick={() => setShowImpayes(false)}>
              <i className="fa-solid fa-times"></i> Fermer
            </button>
          </div>
          {impayes.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#059669' }}>
              <i className="fa-solid fa-check-circle" style={{ fontSize: 28, display: 'block', marginBottom: 8 }}></i>
              Tous les élèves ont payé pour cette période
            </div>
          ) : (
            <div style={{ padding: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th className="col-nom">Élève</th>
                    <th>Matricule</th>
                    <th>Classe</th>
                    <th>Tuteur</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {impayes.map(s => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar nom={s.nom} prenom={s.prenom} photo={s.photo} size={30} />
                          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{s.nom} {s.prenom}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#78716c', fontFamily: 'monospace' }}>{s.matricule || `ETU-${s._id.slice(-6)}`}</td>
                      <td style={{ fontSize: 13, color: '#57534e' }}>{s.classe || '—'}</td>
                      <td style={{ fontSize: 13, color: '#57534e' }}>{s.nomTuteur}</td>
                      <td style={{ fontSize: 13, color: '#57534e' }}>{s.contactParent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="stu-filters">
        <div className="stu-filter-group">
          <i className="fa-solid fa-search"></i>
          <input placeholder="Rechercher par élève, tuteur ou référence..." value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 200 }} />
        </div>
        <div className="stu-filter-group">
          <select value={filtreType} onChange={e => setFiltreType(e.target.value)}>
            <option value="">Tous types</option>
            {Object.entries(TYPES_PAIEMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="stu-filter-group">
          <select value={filtreMode} onChange={e => setFiltreMode(e.target.value)}>
            <option value="">Tous modes</option>
            {Object.entries(MODES_PAIEMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="stu-filter-group">
          <select value={filtreMois} onChange={e => setFiltreMois(e.target.value)}>
            <option value="">Tous mois</option>
            {MOIS.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
          </select>
        </div>
        <div className="stu-filter-group">
          <input type="number" placeholder="Année" value={filtreAnnee} onChange={e => setFiltreAnnee(e.target.value)} style={{ width: 90 }} />
        </div>
        {(search || filtreType || filtreMode || filtreMois || filtreAnnee) && (
          <button className="btn btn-sm" style={{ background: '#f1f0ed', color: '#57534e' }} onClick={() => { setSearch(''); setFiltreType(''); setFiltreMode(''); setFiltreMois(''); setFiltreAnnee(''); setShowImpayes(false); }}>
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
                  <th className="col-nom">Élève</th>
                  <th className="col-paiement-type">Type</th>
                  <th className="col-montant">Montant</th>
                  <th className="col-mois">Période</th>
                  <th className="col-date">Date</th>
                  <th className="col-id">Mode</th>
                  <th className="col-contact">Référence</th>
                  <th className="col-actions" style={{ width: 110 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar nom={p.eleve?.nom} prenom={p.eleve?.prenom} photo={p.eleve?.photo} size={32} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.eleve?.nom} {p.eleve?.prenom}</div>
                          <div style={{ fontSize: 11.5, color: '#9ca3af' }}>{p.eleve?.nomTuteur}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, ...badgeType(p.type) }}>
                        {TYPES_PAIEMENT[p.type] || p.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0a2e2a', fontSize: 14 }}>{p.montant.toLocaleString()} Fcfa</td>
                    <td style={{ fontSize: 12.5, color: '#57534e' }}>
                      {p.mois ? `${MOIS[parseInt(p.mois) - 1]} ${p.annee}` : '-'}
                    </td>
                    <td style={{ fontSize: 12.5, color: '#57534e' }}>
                      {new Date(p.datePaiement).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#f5f5f4', color: '#57534e' }}>
                        <i className={`fa-solid ${p.modePaiement === 'especes' ? 'fa-money-bill-wave' : p.modePaiement === 'cheque' ? 'fa-money-check' : p.modePaiement === 'virement' ? 'fa-building-columns' : 'fa-credit-card'}`} style={{ marginRight: 4, fontSize: 10 }}></i>
                        {MODES_PAIEMENT[p.modePaiement] || p.modePaiement}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>
                      {p.reference || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm" style={{ background: '#ecfdf5', color: '#059669', padding: '5px 9px' }} onClick={() => downloadReceipt(p._id)} title="Reçu PDF"><i className="fa-solid fa-file-pdf"></i></button>
                        <button className="btn btn-sm" style={{ background: '#fffbeb', color: '#d97706', padding: '5px 9px' }} onClick={() => openEdit(p)} title="Modifier"><i className="fa-solid fa-pen"></i></button>
                        <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', padding: '5px 9px' }} onClick={() => handleDelete(p._id)} title="Supprimer"><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: 28, marginBottom: 8, display: 'block' }}></i>
                    Aucun paiement trouvé
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="stu-pagination">
            <div className="stu-pagination-info">
              Affichage {(page - 1) * perPage + 1} à {Math.min(page * perPage, filtered.length)} sur {filtered.length} paiements
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
          <div className="drawer-panel">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f0ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0a2e2a', fontSize: 16 }}>
                <i className="fa-solid fa-coins" style={{ color: '#059669', marginRight: 8 }}></i>
                {editId ? 'Modifier le paiement' : 'Nouveau paiement'}
              </h3>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#78716c', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: 13 }}>{error}</div>}
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
                    <span className="eleve-found-tuteur">{eleveTrouve.nomTuteur}</span>
                  </div>
                )}
                {matriculeInput && !eleveTrouve && (
                  <div className="eleve-not-found">Aucun élève trouvé</div>
                )}
                <input type="hidden" name="eleve" value={form.eleve} />
              </div>
              <div className="form-row" style={{ gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}><label>Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {Object.entries(TYPES_PAIEMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}><label>Montant (Fcfa)</label><input type="number" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} required /></div>
              </div>
              <div className="form-row" style={{ gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}><label>Mois</label>
                  <select value={form.mois} onChange={e => setForm({...form, mois: e.target.value})}>
                    <option value="">-</option>
                    {MOIS.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}><label>Année</label><input type="number" value={form.annee} onChange={e => setForm({...form, annee: e.target.value})} /></div>
              </div>
              <div className="form-row" style={{ gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}><label>Mode de paiement</label>
                  <select value={form.modePaiement} onChange={e => setForm({...form, modePaiement: e.target.value})}>
                    {Object.entries(MODES_PAIEMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}><label>Référence</label><input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} /></div>
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

export default PaymentList;
