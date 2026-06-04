import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/Toast';
import { getImageUrl } from '../config';
import api from '../api/axios';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || ''
  });
  const [passwords, setPasswords] = useState({ motDePasse: '', confirm: '' });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePassChange = e => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (passwords.motDePasse && passwords.motDePasse !== passwords.confirm) {
      addToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form };
      if (passwords.motDePasse) body.motDePasse = passwords.motDePasse;
      if (photo) body.photo = photo;
      const res = await api.put('/auth/profile', body);
      await refreshUser();
      addToast('Profil mis à jour avec succès');
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = photo || getImageUrl(user?.photo);

  return (
    <Layout>
      <div className="breadcrumb">
        <span>Mon Profil</span>
      </div>

      <div className="form-page-title">
        <i className="fa-solid fa-user-circle"></i>
        Mon Profil
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '40px 32px', textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minWidth: 240, flex: 1, maxWidth: 320
        }}>
          <div
            onClick={() => document.getElementById('photo-upload')?.click()}
            style={{
              width: 120, height: 120, borderRadius: '50%',
              background: photoUrl ? 'transparent' : '#1E3B2E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, color: '#fff', fontWeight: 700,
              margin: '0 auto 16px', cursor: 'pointer', overflow: 'hidden',
              border: '3px solid #e5e7eb', position: 'relative',
            }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.nom?.charAt(0)?.toUpperCase() || 'A'
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11,
              padding: '4px 0', fontWeight: 500
            }}>
              <i className="fa-solid fa-camera"></i>
            </div>
          </div>
          <input id="photo-upload" type="file" accept="image/png,image/jpeg" onChange={handlePhoto} style={{ display: 'none' }} />
          <h2 style={{ fontSize: 20, margin: 0 }}>{user?.nom}</h2>
          <p style={{ color: '#78716c', fontSize: 14, margin: '4px 0 12px' }}>{user?.email}</p>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            background: '#e0f2e9', color: '#1E3B2E', fontWeight: 600, fontSize: 12
          }}>
            {user?.role === 'admin' ? 'Administrateur' :
             user?.role === 'directeur' ? 'Directeur' :
             user?.role === 'enseignant' ? 'Enseignant' : 'Comptable'}
          </span>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flex: 2, minWidth: 300 }}>
          <h3 style={{ fontSize: 17, margin: '0 0 20px', color: '#1a1a2e' }}>
            <i className="fa-solid fa-pen-to-square" style={{ marginRight: 8 }}></i>
            Modifier mes informations
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nom complet</label>
                <input name="nom" value={form.nom} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+221 77 123 45 67" />
            </div>

            <h4 style={{ fontSize: 14, margin: '24px 0 12px', color: '#57534e' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 6 }}></i>
              Changer le mot de passe (optionnel)
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input type="password" name="motDePasse" value={passwords.motDePasse} onChange={handlePassChange} placeholder="Laisser vide pour ne pas changer" />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input type="password" name="confirm" value={passwords.confirm} onChange={handlePassChange} placeholder="Confirmer" />
              </div>
            </div>

            <div className="form-footer" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
