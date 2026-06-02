import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const sexes = ['Masculin', 'Féminin'];

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef(null);
  const [matieres, setMatieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [form, setForm] = useState({
    nom: '', prenom: '', identifiant: '', dateNaissance: '', sexe: 'Masculin',
    telephone: '', adresse: '', dateEmbauche: new Date().toISOString().split('T')[0],
    matiere: '', niveauEnseignement: '', classes: []
  });

  useEffect(() => {
    Promise.all([
      api.get('/subjects').then(r => r.data.map(s => s.nom)),
      api.get('/levels').then(r => r.data.map(l => l.nom)),
      api.get('/classes').then(r => r.data.map(c => c.nom)),
    ]).then(([m, n, c]) => {
      setMatieres(m);
      setNiveaux(n);
      setClassOptions(c);
      if (!isEdit) {
        setForm(prev => ({ ...prev, matiere: m[0] || '', niveauEnseignement: n[0] || '' }));
      }
    }).catch(() => addToast('Erreur chargement données', 'error'));
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/teachers/${id}`)
        .then(res => {
          const t = res.data;
          setForm({
            nom: t.nom || '', prenom: t.prenom || '', identifiant: t.identifiant || '',
            dateNaissance: t.dateNaissance?.split('T')[0] || '', sexe: t.sexe || 'Masculin',
            telephone: t.telephone || '', adresse: t.adresse || '',
            dateEmbauche: t.dateEmbauche?.split('T')[0] || '',
            matiere: t.matiere || t.specialite || '',
            niveauEnseignement: t.niveauEnseignement || '',
            classes: t.classes || []
          });
          if (t.photo) setPhotoPreview(t.photo);
        })
        .catch(() => addToast('Erreur lors du chargement', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleClass = (cls) => {
    setForm(prev => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter(c => c !== cls)
        : [...prev.classes, cls]
    }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        photo: photoPreview || ''
      };
      if (isEdit) { await api.put(`/teachers/${id}`, payload); addToast('Enseignant modifié'); }
      else { await api.post('/teachers', payload); addToast('Enseignant ajouté'); }
      navigate('/enseignants');
    } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); }
  };

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> <span className="breadcrumb-sep">/</span>
        <Link to="/enseignants">Enseignants</Link> <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{isEdit ? 'Modifier un enseignant' : 'Ajouter un enseignant'}</span>
      </div>

      <div className="form-page-title">
        <i className="fa-solid fa-chalkboard-user"></i>
        {isEdit ? 'Modifier un enseignant' : 'Ajouter un enseignant'}
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Informations personnelles */}
          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-user"></i> Informations personnelles
            </div>
            <div className="form-section-body">
              <div className="form-layout-with-photo">
                <div className="form-photo-col">
                  <div className="photo-zone" onClick={() => fileRef.current?.click()}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Photo" className="photo-preview" />
                    ) : (
                      <>
                        <div className="photo-zone-icon"><i className="fa-solid fa-camera"></i></div>
                        <div className="photo-zone-text">Photo de l'enseignant</div>
                        <div className="photo-zone-hint">PNG, JPG (max 2Mo)</div>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={handlePhoto} style={{ display: 'none' }} />
                  </div>
                </div>
                <div className="form-fields-col">
                  <div className="form-row">
                    <div className="form-group required">
                      <label>Nom complet</label>
                      <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Nom" />
                      <input name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Prénom" style={{ marginTop: 8 }} />
                    </div>
                    <div className="form-group required">
                      <label>Identifiant</label>
                      <input name="identifiant" value={form.identifiant} onChange={handleChange} required placeholder="Ex: ENS-001" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group required">
                      <label>Date de naissance</label>
                      <input type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange} required />
                    </div>
                    <div className="form-group required">
                      <label>Sexe</label>
                      <select name="sexe" value={form.sexe} onChange={handleChange} required>
                        {sexes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group required">
                      <label>Téléphone</label>
                      <input name="telephone" value={form.telephone} onChange={handleChange} required placeholder="Ex: 77 123 45 67" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Adresse</label>
                      <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Ex: Dakar" />
                    </div>
                    <div className="form-group required">
                      <label>Date d'embauche</label>
                      <input type="date" name="dateEmbauche" value={form.dateEmbauche} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Informations professionnelles */}
          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-briefcase"></i> Informations professionnelles
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-group required">
                  <label>Matières enseignées</label>
                  <select name="matiere" value={form.matiere} onChange={handleChange} required>
                    {matieres.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group required">
                  <label>Niveau d'enseignement</label>
                  <select name="niveauEnseignement" value={form.niveauEnseignement} onChange={handleChange} required>
                    {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Classe(s) attribuée(s)</label>
                <div className="checkbox-grid">
                  {classOptions.map(cls => (
                    <label key={cls} className="checkbox-chip">
                      <input type="checkbox" checked={form.classes.includes(cls)} onChange={() => toggleClass(cls)} />
                      {cls}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="form-footer">
            <div></div>
            <div className="form-actions-right">
              <button type="button" className="btn btn-cancel" onClick={() => navigate('/enseignants')}>
                <i className="fa-solid fa-times"></i> Annuler
              </button>
              <button type="submit" className="btn btn-primary btn-lg">
                <i className="fa-solid fa-save"></i> Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TeacherForm;
