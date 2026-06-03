import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Common/Toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setGeneratedCode(res.data.code);
      setStep(2);
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (motDePasse !== confirm) {
      addToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (motDePasse.length < 6) {
      addToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, motDePasse });
      addToast('Mot de passe réinitialisé ! Connectez-vous.');
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || 'Code invalide ou expiré', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <div className="auth-logo-icon"><i className="fa-solid fa-mosque"></i></div>
            <div className="auth-logo-text"><h2>École Coranique</h2><p>Gestion Scolaire</p></div>
          </div>
          <div className="auth-message">
            <h1>Mot de passe oublié ?</h1>
            <p>Réinitialisez votre mot de passe<br />en quelques étapes.</p>
          </div>
          <div className="auth-illustration"><i className="fa-solid fa-key"></i></div>
          <div className="auth-footer">© 2025 École Coranique</div>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {step === 1 ? (
            <>
              <h2 className="auth-form-title">Réinitialisation</h2>
              <p className="auth-form-subtitle">Entrez votre email pour recevoir<br />un code de réinitialisation</p>
              <form onSubmit={handleSendCode}>
                <div className="auth-field">
                  <label>Email <span className="required-star">*</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@exemple.com" />
                </div>
                <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
                  <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i> Envoyer le code
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="auth-form-title">Nouveau mot de passe</h2>
              <p className="auth-form-subtitle">Utilisez le code ci-dessous pour<br />réinitialiser votre mot de passe</p>
              {generatedCode && (
                <div className="reset-code-box">
                  <div className="reset-code-label">Code de réinitialisation</div>
                  <div className="reset-code-value">{generatedCode}</div>
                </div>
              )}
              <form onSubmit={handleReset}>
                <div className="auth-field">
                  <label>Confirmez le code <span className="required-star">*</span></label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="Entrez le code ci-dessus" maxLength={6} />
                </div>
                <div className="auth-field">
                  <label>Nouveau mot de passe <span className="required-star">*</span></label>
                  <input type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required placeholder="Min. 6 caractères" />
                </div>
                <div className="auth-field">
                  <label>Confirmer <span className="required-star">*</span></label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Confirmer le mot de passe" />
                </div>
                <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
                  <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-check'}`}></i> Réinitialiser
                </button>
              </form>
            </>
          )}
          <p className="auth-switch">
            <Link to="/login"><i className="fa-solid fa-arrow-left"></i> Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;