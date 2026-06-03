import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const Annonces = () => {
  const { user } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ titre: '', contenu: '', badge: 'Info' });
  const [loading, setLoading] = useState(true);

  const canCreate = user && ['admin', 'directeur'].includes(user.role);
  const canDelete = user && user.role === 'admin';
  const socket = useSocket();

  useEffect(() => {
    api.get('/announcements')
      .then(res => setAnnonces(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket?.socket) return;
    const onNew = (ann) => setAnnonces(prev => [ann, ...prev]);
    const onDelete = (id) => setAnnonces(prev => prev.filter(a => a._id !== id));
    socket.socket.on('new-announcement', onNew);
    socket.socket.on('delete-announcement', onDelete);
    return () => {
      socket.socket.off('new-announcement', onNew);
      socket.socket.off('delete-announcement', onDelete);
    };
  }, [socket?.socket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.contenu.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    try {
      const res = await api.post('/announcements', form);
      setAnnonces(prev => [res.data, ...prev]);
      setShowModal(false);
      setForm({ titre: '', contenu: '', badge: 'Info' });
      toast.success('Annonce publiée');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnonces(prev => prev.filter(a => a._id !== id));
      toast.success('Annonce supprimée');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const getBadgeStyle = (badge) => {
    if (badge === 'Important') return { background: '#fef2f2', color: '#b91c1c' };
    if (badge === 'Urgent') return { background: '#fef2f2', color: '#b91c1c' };
    return { background: '#ecfdf5', color: '#0d7a5e' };
  };

  if (loading) return <Layout><div className="loading"><div className="spinner"></div> Chargement...</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Annonces</h1>
          <p>Gérez les annonces et communications</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-plus"></i> Nouvelle annonce
          </button>
        )}
      </div>

      <div className="annonces-list">
        {annonces.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            <i className="fa-solid fa-bullhorn" style={{ fontSize: 40, display: 'block', marginBottom: 12 }}></i>
            Aucune annonce pour le moment
          </div>
        ) : annonces.map(ann => (
          <div className="announce-item" key={ann._id}>
            <div className="announce-header">
              <span className="announce-badge" style={getBadgeStyle(ann.badge)}>{ann.badge}</span>
              <span className="announce-date">{new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="announce-title">{ann.titre}</div>
            <div className="announce-text">{ann.contenu}</div>
            {canDelete && (
              <button className="btn-delete-sm" onClick={() => handleDelete(ann._id)}>
                <i className="fa-solid fa-trash-can"></i> Supprimer
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle annonce</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre</label>
                <input type="text" className="form-control" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Titre de l'annonce" />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select className="form-control" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })}>
                  <option value="Info">Info</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contenu</label>
                <textarea className="form-control" rows={4} value={form.contenu} onChange={e => setForm({ ...form, contenu: e.target.value })} placeholder="Contenu de l'annonce"></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Publier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Annonces;
