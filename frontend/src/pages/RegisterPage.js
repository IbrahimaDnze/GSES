import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Common/Toast';
import api from '../api/axios';

const roles = ['admin', 'directeur', 'enseignant', 'comptable'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '', role: 'enseignant',
    motDePasse: '', confirmMotDePasse: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return addToast('Veuillez accepter les conditions d\'utilisation', 'error');
    if (form.motDePasse !== form.confirmMotDePasse) return addToast('Les mots de passe ne correspondent pas', 'error');
    try {
      await api.post('/auth/register', { nom: form.nom, email: form.email, motDePasse: form.motDePasse, telephone: form.telephone, role: form.role });
      addToast('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (err) { addToast(err.response?.data?.message || 'Erreur lors de l\'inscription', 'error'); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <i className="fa-solid fa-mosque"></i>
            </div>
            <div className="auth-logo-text">
              <h2>École Coranique</h2>
              <p>Gestion Scolaire</p>
            </div>
          </div>
          <div className="auth-message">
            <h1>Bienvenue !</h1>
            <p>Créez votre compte pour accéder à votre espace<br />et gérer efficacement votre école coranique.</p>
          </div>
          <div className="auth-footer">
            © 2025 École Coranique - Tous droits réservés
          </div>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Créer un compte</h2>
          <p className="auth-form-subtitle">Remplissez le formulaire pour vous inscrire</p>
          <form onSubmit={handleSubmit}>
            <div className="auth-row">
              <div className="auth-field">
                <label>Nom complet <span className="required-star">*</span></label>
                <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Votre nom" />
              </div>
              <div className="auth-field">
                <label>Email <span className="required-star">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@exemple.com" />
              </div>
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Téléphone <span className="required-star">*</span></label>
                <input name="telephone" value={form.telephone} onChange={handleChange} required placeholder="77 123 45 67" />
              </div>
              <div className="auth-field">
                <label>Rôle <span className="required-star">*</span></label>
                <select name="role" value={form.role} onChange={handleChange} required>
                  {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Mot de passe <span className="required-star">*</span></label>
                <div className="password-field">
                  <input type={showPassword ? 'text' : 'password'} name="motDePasse" value={form.motDePasse} onChange={handleChange} required placeholder="••••••••" />
                  <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
              </div>
              <div className="auth-field">
                <label>Confirmer le mot de passe <span className="required-star">*</span></label>
                <div className="password-field">
                  <input type={showConfirm ? 'text' : 'password'} name="confirmMotDePasse" value={form.confirmMotDePasse} onChange={handleChange} required placeholder="••••••••" />
                  <span className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                    <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
              </div>
            </div>
            <label className="terms-checkbox">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
              <span>J'accepte les conditions d'utilisation et la politique de confidentialité.</span>
            </label>
            <button type="submit" className="btn btn-primary btn-auth">
              <i className="fa-solid fa-user-plus"></i> S'inscrire
            </button>
          </form>
          <p className="auth-switch">
            Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
