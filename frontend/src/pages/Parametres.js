import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useToast } from '../components/Common/Toast';
import { useSettings } from '../context/SettingsContext';
import api from '../api/axios';

const langues = ['Français', 'Arabe', 'Anglais', 'Wolof'];
const devises = ['Franc CFA (XOF)', 'Franc Guinée (GNF)', 'Euro (EUR)', 'Dollar US (USD)', 'Dirham (MAD)', 'Naira (NGN)'];

const Parametres = () => {
  const { addToast } = useToast();
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState({
    nomEcole: 'École Coranique Al Nour',
    anneeScolaire: '2025 - 2026',
    email: '',
    langue: 'Français',
    devise: 'Franc Guinée (GNF)'
  });
  const [logo, setLogo] = useState(null);
  const [signature, setSignature] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        nomEcole: settings.nomEcole || 'École Coranique Al Nour',
        anneeScolaire: settings.anneeScolaire || '2025 - 2026',
        email: settings.email || '',
        langue: settings.langue || 'Français',
        devise: settings.devise || 'Franc Guinée (GNF)'
      });
    }
  }, [settings]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      if (logo) body.logo = logo;
      if (signature) body.signature = signature;
      await api.put('/settings', body);
      refresh();
      addToast('Modifications enregistrées avec succès');
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/">Accueil</Link> <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Paramètres</span>
      </div>

      <div className="form-page-title">
        <i className="fa-solid fa-sliders"></i>
        Paramètres
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-building"></i> Informations générales
            </div>
            <div className="form-section-body">
              <div className="params-grid">
                <div className="params-item">
                  <div className="params-item-icon"><i className="fa-solid fa-school"></i></div>
                  <div className="params-item-content">
                    <div className="params-label">Informations de l'école</div>
                    <div className="params-value">{form.nomEcole}</div>
                  </div>
                </div>
                <div className="params-item">
                  <div className="params-item-icon"><i className="fa-solid fa-envelope"></i></div>
                  <div className="params-item-content">
                    <div className="params-label">Email</div>
                    <div className="params-value">{form.email || 'Non défini'}</div>
                  </div>
                </div>
                <div className="params-item">
                  <div className="params-item-icon"><i className="fa-solid fa-money-bill"></i></div>
                  <div className="params-item-content">
                    <div className="params-label">Devise</div>
                    <div className="params-value">{form.devise}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-pen-to-square"></i> Modifier les informations
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom de l'école</label>
                  <input name="nomEcole" value={form.nomEcole} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Année scolaire</label>
                  <input name="anneeScolaire" value={form.anneeScolaire} onChange={handleChange} placeholder="Ex: 2025 - 2026" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@ecole.com" />
                </div>
                <div className="form-group">
                  <label>Langue</label>
                  <select name="langue" value={form.langue} onChange={handleChange}>
                    {langues.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                  <label>Devise</label>
                  <select name="devise" value={form.devise} onChange={handleChange}>
                    {devises.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Logo de l'école</label>
                  <div className="file-upload" onClick={() => document.getElementById('logo-upload')?.click()}>
                    <div className="file-upload-icon"><i className="fa-solid fa-image"></i></div>
                    <span className="file-upload-text">{logo ? 'Logo sélectionné' : 'Choisir un fichier'}</span>
                    <span className="file-hint">PNG, JPG (max 2Mo)</span>
                    <input id="logo-upload" type="file" accept="image/png,image/jpeg" onChange={(e) => handleFile(e, setLogo)} style={{ display: 'none' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Signature</label>
                  <div className="file-upload" onClick={() => document.getElementById('sig-upload')?.click()}>
                    <div className="file-upload-icon"><i className="fa-solid fa-pen"></i></div>
                    <span className="file-upload-text">{signature ? 'Signature sélectionnée' : 'Choisir un fichier'}</span>
                    <span className="file-hint">PNG, JPG (max 1Mo)</span>
                    <input id="sig-upload" type="file" accept="image/png,image/jpeg" onChange={(e) => handleFile(e, setSignature)} style={{ display: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-footer" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Parametres;
