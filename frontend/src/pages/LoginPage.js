import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/Toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({ email: '', motDePasse: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.motDePasse, rememberMe);
      navigate('/');
    } catch (err) { addToast(err.response?.data?.message || 'Email ou mot de passe incorrect', 'error'); }
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
            <h1>Bon retour !</h1>
            <p>Connectez-vous à votre compte<br />pour continuer à gérer votre école coranique.</p>
          </div>
          <div className="auth-illustration">
            <i className="fa-solid fa-book-quran"></i>
          </div>
          <div className="auth-footer">
            © 2025 École Coranique - Tous droits réservés
          </div>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Se connecter</h2>
          <p className="auth-form-subtitle">Entrez vos identifiants<br />pour accéder à votre compte</p>
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email <span className="required-star">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@exemple.com" />
            </div>
            <div className="auth-field">
              <label>Mot de passe <span className="required-star">*</span></label>
              <div className="password-field">
                <input type={showPassword ? 'text' : 'password'} name="motDePasse" value={form.motDePasse} onChange={handleChange} required placeholder="••••••••" />
                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
            </div>
            <div className="auth-options">
              <label className="remember-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">Mot de passe oublié ?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-auth">
              <i className="fa-solid fa-right-to-bracket"></i> Se connecter
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
