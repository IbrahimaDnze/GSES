import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../api/axios';

const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const joursSemaine = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const Calendrier = () => {
  const aujourdhui = new Date();
  const [moisCourant, setMoisCourant] = useState(aujourdhui.getMonth());
  const [anneeCourante, setAnneeCourante] = useState(aujourdhui.getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events', { params: { mois: moisCourant + 1, annee: anneeCourante } })
      .then(r => setEvents(r.data))
      .catch(() => {});
  }, [moisCourant, anneeCourante]);

  const premierJour = new Date(anneeCourante, moisCourant, 1).getDay();
  const joursDansMois = new Date(anneeCourante, moisCourant + 1, 0).getDate();

  const naviguer = (direction) => {
    let newMois = moisCourant + direction;
    let newAnnee = anneeCourante;
    if (newMois < 0) { newMois = 11; newAnnee--; }
    if (newMois > 11) { newMois = 0; newAnnee++; }
    setMoisCourant(newMois);
    setAnneeCourante(newAnnee);
  };

  const getEvenementsJour = (jour) => {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === jour && d.getMonth() === moisCourant && d.getFullYear() === anneeCourante;
    });
  };

  const getTypeColor = (type) => {
    const colors = { examen: '#ef4444', reunion: '#3b82f6', evenement: '#10b981' };
    return colors[type] || '#6366f1';
  };

  const getTypeLabel = (type) => {
    const labels = { examen: 'Examen', reunion: 'Réunion', evenement: 'Événement' };
    return labels[type] || type;
  };

  return (
    <Layout>
      <div className="breadcrumb">
        <span className="breadcrumb-current">Calendrier</span>
      </div>

      <div className="form-page-title">
        <i className="fa-solid fa-calendar-days"></i> Calendrier des événements
      </div>

      <div className="form-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button className="btn btn-cancel" onClick={() => naviguer(-1)} style={{ padding: '8px 16px' }}>
            <i className="fa-solid fa-chevron-left"></i> {mois[(moisCourant - 1 + 12) % 12]}
          </button>
          <h3 style={{ margin: 0, color: '#0f172a' }}>{mois[moisCourant]} {anneeCourante}</h3>
          <button className="btn btn-cancel" onClick={() => naviguer(1)} style={{ padding: '8px 16px' }}>
            {mois[(moisCourant + 1) % 12]} <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, background: '#e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          {joursSemaine.map(j => (
            <div key={j} style={{ background: '#0d7a5e', color: '#fff', padding: '10px 4px', textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
              {j}
            </div>
          ))}
          {Array.from({ length: premierJour }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: '#fff', minHeight: 90, padding: 6 }}></div>
          ))}
          {Array.from({ length: joursDansMois }).map((_, i) => {
            const jour = i + 1;
            const evts = getEvenementsJour(jour);
            const estAujourdhui = jour === aujourdhui.getDate() && moisCourant === aujourdhui.getMonth() && anneeCourante === aujourdhui.getFullYear();
            return (
              <div key={jour} style={{
                background: '#fff', minHeight: 90, padding: 6, cursor: 'pointer',
                border: estAujourdhui ? '2px solid #0d7a5e' : 'none',
                borderRadius: estAujourdhui ? 8 : 0
              }}>
                <div style={{ fontWeight: estAujourdhui ? 700 : 500, color: estAujourdhui ? '#0d7a5e' : '#0f172a', marginBottom: 4, fontSize: 14 }}>{jour}</div>
                {evts.map((ev, idx) => (
                  <div key={idx} onClick={() => { setModalEvent(ev); setShowModal(true); }}
                    style={{ fontSize: 11, background: getTypeColor(ev.type), color: '#fff', borderRadius: 6, padding: '2px 6px', marginBottom: 2, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.titre}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        {['examen', 'reunion', 'evenement'].map(k => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: getTypeColor(k) }}></span> {getTypeLabel(k)}
          </div>
        ))}
      </div>

      {showModal && modalEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 30, minWidth: 360, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>{modalEvent.titre}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
              <i className="fa-solid fa-calendar-day" style={{ marginRight: 8, color: getTypeColor(modalEvent.type) }}></i>
              {new Date(modalEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: getTypeColor(modalEvent.type) + '20', color: getTypeColor(modalEvent.type), textTransform: 'capitalize' }}>
              {modalEvent.type}
            </div>
            <p style={{ marginTop: 16, color: '#475569', fontSize: 14 }}>{modalEvent.description || 'Aucun détail supplémentaire pour cet événement.'}</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Calendrier;
