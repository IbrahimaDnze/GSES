import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const sexes = ['garcon', 'fille'];

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const fileRef = useRef(null);
  const [niveauxList, setNiveauxList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [form, setForm] = useState({
    nom: '', prenom: '', matricule: '', dateNaissance: '', lieuNaissance: '',
    sexe: 'garcon', classe: '', niveauCoranique: '',
    dateInscription: new Date().toISOString().split('T')[0],
    nomTuteur: '', contactParent: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/levels').then(r => r.data.map(l => l.nom)),
      api.get('/classes').then(r => r.data.map(c => c.nom)),
    ]).then(([n, c]) => {
      setNiveauxList(n);
      setClassesList(c);
      if (!isEdit) {
        setForm(prev => ({ ...prev, niveauCoranique: n[0] || '', classe: c[0] || '' }));
      }
    }).catch(() => addToast('Erreur chargement données', 'error'));
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/students/${id}`)
        .then(res => {
          const s = res.data;
          setForm({
            nom: s.nom || '', prenom: s.prenom || '', matricule: s.matricule || '',
            dateNaissance: s.dateNaissance?.split('T')[0] || '', lieuNaissance: s.lieuNaissance || '',
            sexe: s.sexe || 'garcon',
            classe: s.classe || '', niveauCoranique: s.niveauCoranique || '',
            dateInscription: s.dateInscription?.split('T')[0] || '',
            nomTuteur: s.nomTuteur || '', contactParent: s.contactParent || ''
          });
          if (s.photo) setPhotoPreview(s.photo);
        })
        .catch(() => addToast('Erreur lors du chargement', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return addToast('Veuillez accepter les conditions d\'utilisation', 'error');
    try {
      const payload = {
        ...form,
        photo: photoPreview || '',
        classe: form.classe
      };
      if (isEdit) { await api.put(`/students/${id}`, payload); addToast('Élève modifié'); }
      else { await api.post('/students', payload); addToast('Élève ajouté'); }
      navigate('/eleves');
    } catch (err) { addToast(err.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error'); }
  };

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> <span className="breadcrumb-sep">/</span>
        <Link to="/eleves">Élèves</Link> <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{isEdit ? 'Modifier un élève' : 'Ajouter un élève'}</span>
      </div>

      <div className="form-page-title">
        <i className="fa-solid fa-user-graduate"></i>
        {isEdit ? 'Modifier un élève' : 'Ajouter un élève'}
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
                        <div className="photo-zone-text">Photo de l'élève</div>
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
                      <label>Matricule</label>
                      <input name="matricule" value={form.matricule} onChange={handleChange} required placeholder="Ex: ETU-001" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group required">
                      <label>Date de naissance</label>
                      <input type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange} required />
                    </div>
                    <div className="form-group required">
                      <label>Lieu de naissance</label>
                      <input name="lieuNaissance" value={form.lieuNaissance} onChange={handleChange} required placeholder="Ex: Dakar" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group required">
                      <label>Sexe</label>
                      <select name="sexe" value={form.sexe} onChange={handleChange} required>
                        <option value="garcon">Garçon</option>
                        <option value="fille">Fille</option>
                      </select>
                    </div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Informations scolaires */}
          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-book"></i> Informations scolaires
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-group required">
                  <label>Classe</label>
                  <select name="classe" value={form.classe} onChange={handleChange} required>
                    <option value="">Sélectionner une classe</option>
                    {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group required">
                  <label>Niveau</label>
                  <select name="niveauCoranique" value={form.niveauCoranique} onChange={handleChange} required>
                    {niveauxList.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group required">
                  <label>Date d'inscription</label>
                  <input type="date" name="dateInscription" value={form.dateInscription} onChange={handleChange} required />
                </div>
            </div>
          </div>

          {/* Section 3: Parent / Tuteur */}
          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-users"></i> Informations du parent / tuteur
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-group required">
                  <label>Nom du parent / tuteur</label>
                  <input name="nomTuteur" value={form.nomTuteur} onChange={handleChange} required placeholder="Ex: M. Diop" />
                </div>
                <div className="form-group required">
                  <label>Téléphone</label>
                  <input name="contactParent" value={form.contactParent} onChange={handleChange} required placeholder="Ex: 77 123 45 67" />
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Actions */}
          <div className="form-footer">
            <label className="terms-checkbox">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
              <span>J'accepte les conditions d'utilisation et la politique de confidentialité.</span>
            </label>
            <div className="form-actions-right">
              <button type="button" className="btn btn-cancel" onClick={() => navigate('/eleves')}>
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

export default StudentForm;
