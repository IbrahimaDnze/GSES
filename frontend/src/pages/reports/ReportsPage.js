import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useToast } from '../../components/Common/Toast';
import { API_BASE } from '../../config';
import api from '../../api/axios';

const ReportsPage = () => {
  const { addToast } = useToast();
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const download = async (url, filename) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erreur');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (err) { addToast('Erreur de téléchargement', 'error'); }
  };

  const reports = [
    { label: 'Liste des eleves PDF', icon: 'fa-file-pdf', color: '#e74c3c', action: () => download('/reports/eleves/pdf', 'liste-eleves.pdf') },
    { label: 'Liste des eleves Excel', icon: 'fa-file-excel', color: '#27ae60', action: () => download('/reports/eleves/excel', 'liste-eleves.xlsx') },
    { label: 'Rapport paiements PDF', icon: 'fa-file-pdf', color: '#e74c3c', action: () => download(`/reports/paiements/pdf?mois=${String(mois).padStart(2, '0')}&annee=${annee}`, 'rapport-paiements.pdf') },
    { label: 'Rapport paiements Excel', icon: 'fa-file-excel', color: '#27ae60', action: () => download(`/reports/paiements/excel?mois=${String(mois).padStart(2, '0')}&annee=${annee}`, 'rapport-paiements.xlsx') },
    { label: 'Rapport presences PDF', icon: 'fa-file-pdf', color: '#e74c3c', action: () => download(`/reports/presences/pdf?mois=${mois}&annee=${annee}`, 'rapport-presences.pdf') },
  ];

  return (
    <Layout title="Rapports">
      <div className="filter-bar">
        <label>Mois:</label>
        <select value={mois} onChange={e => setMois(Number(e.target.value))}>
          {['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'].map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <label>Annee:</label>
        <input type="number" value={annee} onChange={e => setAnnee(Number(e.target.value))} style={{ width: 100 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {reports.map((r, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 25, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }} onClick={r.action}>
            <i className={`fa-solid ${r.icon}`} style={{ fontSize: 40, color: r.color, marginBottom: 10 }}></i>
            <h4>{r.label}</h4>
            <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>Cliquez pour telecharger</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default ReportsPage;
