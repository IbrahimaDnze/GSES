import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../api/axios';
import { Toaster, toast } from 'react-hot-toast';
import { getImageUrl } from '../config';

const Cartes = () => {
  const [onglet, setOnglet] = useState('eleve');
  const [liste, setListe] = useState([]);
  const [selectionnes, setSelectionnes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(false);
  const [filtreClasse, setFiltreClasse] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const r = await api.get(`/${onglet === 'eleve' ? 'students' : 'teachers'}`);
        setListe(r.data);
        setSelectionnes([]);
        setFiltreClasse('');
      } catch (err) {
        toast.error('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [onglet]);

  const classes = useMemo(() => {
    return [...new Set(liste.filter(s => s.classe).map(s => s.classe))].sort();
  }, [liste]);

  const listeFiltree = useMemo(() => {
    if (!filtreClasse) return liste;
    return liste.filter(item => item.classe === filtreClasse);
  }, [liste, filtreClasse]);

  useEffect(() => {
    setSelectionnes([]);
  }, [filtreClasse]);

  const selectionnerClasse = () => {
    setSelectionnes(listeFiltree.map(item => item._id));
  };

  const toutSelectionner = () => {
    setSelectionnes(liste.map(item => item._id));
  };

  const toutDeselectionner = () => {
    setSelectionnes([]);
  };

  const basculer = (id) => {
    setSelectionnes(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const genererCartes = async () => {
    if (!selectionnes.length) return toast.error('Sélectionnez au moins un élément');
    setGeneration(true);
    try {
      const r = await api.post('/cards', { type: onglet, ids: selectionnes }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cartes-${onglet}s.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Cartes générées avec succès');
    } catch (err) {
      toast.error('Erreur lors de la génération');
    } finally {
      setGeneration(false);
    }
  };

  return (
    <Layout>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="breadcrumb">
        <span className="breadcrumb-current">Cartes</span>
      </div>

      <div className="form-page-title">
        <i className="fa-solid fa-id-card"></i> Génération de cartes
      </div>

      <div className="form-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className={`btn ${onglet === 'eleve' ? 'btn-primary' : 'btn-cancel'}`} onClick={() => setOnglet('eleve')}>
              <i className="fa-solid fa-graduation-cap"></i> Élèves
            </button>
            <button className={`btn ${onglet === 'enseignant' ? 'btn-primary' : 'btn-cancel'}`} onClick={() => setOnglet('enseignant')}>
              <i className="fa-solid fa-chalkboard-user"></i> Enseignants
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onglet === 'eleve' && classes.length > 0 && (
              <div className="stu-filter-group" style={{ marginBottom: 0 }}>
                <select value={filtreClasse} onChange={e => setFiltreClasse(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12.5 }}>
                  <option value="">Toutes les classes</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            {filtreClasse && (
              <button className="btn btn-sm btn-cancel" onClick={selectionnerClasse} style={{ fontSize: 12 }}>
                <i className="fa-solid fa-users"></i> Sélectionner la classe
              </button>
            )}
            <button className="btn btn-cancel" onClick={toutSelectionner} style={{ fontSize: 12 }}>
              <i className="fa-solid fa-check-double"></i> Tout
            </button>
            <button className="btn btn-cancel" onClick={toutDeselectionner} style={{ fontSize: 12 }}>
              <i className="fa-solid fa-times"></i> Aucun
            </button>
            <button className="btn btn-primary" onClick={genererCartes} disabled={generation || !selectionnes.length} style={{ fontSize: 12 }}>
              <i className="fa-solid fa-id-card"></i> {generation ? 'Génération...' : `Générer (${selectionnes.length})`}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Chargement...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {listeFiltree.map(item => {
              const isSelected = selectionnes.includes(item._id);
              return (
                <div key={item._id} onClick={() => basculer(item._id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12,
                  cursor: 'pointer', border: isSelected ? '2px solid #1E3B2E' : '2px solid #e5e7eb',
                  background: isSelected ? '#f0fdf4' : '#fff', transition: 'all 0.15s'
                }}>
                  <input type="checkbox" checked={isSelected} onChange={() => basculer(item._id)} style={{ width: 18, height: 18, accentColor: '#1E3B2E' }} />
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f1f0ed', overflow: 'hidden', flexShrink: 0 }}>
                    {item.photo ? (
                       <img src={getImageUrl(item.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e', fontSize: 16 }}>
                        <i className="fa-solid fa-user"></i>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{item.nom} {item.prenom}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {onglet === 'eleve' ? (
                        <>{item.matricule || 'Pas de matricule'} · {item.classe || '—'}</>
                      ) : (
                        <>{item.identifiant || 'Pas d\'ID'} · {item.matiere || '—'}</>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && liste.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            <i className="fa-solid fa-users" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}></i>
            Aucun {onglet === 'eleve' ? 'élève' : 'enseignant'} trouvé
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cartes;
