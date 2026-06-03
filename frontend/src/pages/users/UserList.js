import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const UserList = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '', role: 'enseignant', telephone: '' });
  const [error, setError] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then(res => setUsers(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
  };

  const fetchTeachers = () => {
    api.get('/teachers').then(res => setTeachers(res.data)).catch(() => {});
  };

  useEffect(() => { fetchUsers(); fetchTeachers(); }, []);

  const handleRoleChange = (role) => {
    setForm(prev => ({ ...prev, role, nom: '', email: '' }));
    if (role === 'enseignant') fetchTeachers();
  };

  const handleTeacherSelect = (e) => {
    const id = e.target.value;
    if (!id) { setForm(prev => ({ ...prev, nom: '', email: '' })); return; }
    const t = teachers.find(tc => tc._id === id);
    if (t) setForm(prev => ({ ...prev, nom: t.nom, email: t.email || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', form); addToast('Utilisateur créé');
      setShowForm(false);
      setForm({ nom: '', email: '', motDePasse: '', role: 'enseignant', telephone: '' });
      fetchUsers();
    } catch (err) { setError(err.response?.data?.message || 'Erreur'); addToast(err.response?.data?.message || 'Erreur', 'error'); }
  };

  const handleToggleActive = async (id, actif) => {
    try { await api.put(`/users/${id}`, { actif: !actif }); addToast(actif ? 'Utilisateur désactivé' : 'Utilisateur activé'); fetchUsers(); } catch (err) { addToast('Erreur', 'error'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      try { await api.delete(`/users/${id}`); addToast('Utilisateur supprimé'); fetchUsers(); } catch (err) { addToast(err.response?.data?.message || 'Erreur', 'error'); }
    }
  };

  const roleBadge = { admin: 'badge-admin', directeur: 'badge-directeur', enseignant: 'badge-enseignant', comptable: 'badge-comptable' };

  return (
    <Layout title="Gestion des Utilisateurs">
      <div className="page-header">
        <h2>Utilisateurs</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fa-solid fa-plus"></i> {showForm ? 'Fermer' : 'Ajouter'}
        </button>
      </div>

      {showForm && (
        <div className="form-container" style={{ marginBottom: 20 }}>
          <h3>Nouvel utilisateur</h3>
          {error && <div className="toast-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Role</label>
                <select value={form.role} onChange={e => handleRoleChange(e.target.value)}>
                  <option value="enseignant">Enseignant</option><option value="directeur">Directeur</option>
                  <option value="admin">Administrateur</option><option value="comptable">Comptable</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input type="password" value={form.motDePasse} onChange={e => setForm({...form, motDePasse: e.target.value})} required />
              </div>
            </div>
            {form.role === 'enseignant' ? (
              <div className="form-group">
                <label>Enseignant</label>
                <select value={form.nom ? teachers.find(t => t.nom === form.nom)?._id || '' : ''} onChange={handleTeacherSelect} required>
                  <option value="">-- Sélectionnez un enseignant --</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.nom} {t.prenom} {t.email ? `(${t.email})` : ''}</option>
                  ))}
                </select>
                {teachers.length === 0 && <small style={{ color: '#b91c1c' }}>Aucun enseignant trouvé. Créez d'abord un enseignant.</small>}
              </div>
            ) : (
              <div className="form-group"><label>Nom</label><input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required /></div>
            )}
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            <div className="form-group"><label>Telephone</label><input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} /></div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary"><i className="fa-solid fa-save"></i> Creer</button>
              <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ border: '1px solid #ddd' }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Loading /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th className="col-nom">Nom</th><th className="col-contact">Email</th><th className="col-matiere">Role</th><th className="col-statut">Statut</th><th className="col-actions">Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.nom}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${roleBadge[u.role]}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.actif ? 'badge-present' : 'badge-absent'}`}>{u.actif ? 'Actif' : 'Inactif'}</span></td>
                  <td>
                    <button className={`btn btn-sm ${u.actif ? 'btn-warning' : 'btn-success'}`} onClick={() => handleToggleActive(u._id, u.actif)}>
                      <i className={`fa-solid ${u.actif ? 'fa-ban' : 'fa-check'}`}></i> {u.actif ? 'Desactiver' : 'Activer'}
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ marginLeft: 5 }} onClick={() => handleDelete(u._id)}><i className="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 30, color: '#999' }}>Aucun utilisateur</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default UserList;
