import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import api from '../api/axios';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      api.get('/students').then(r => r.data),
      api.get('/teachers').then(r => r.data),
      api.get('/attendance').then(r => r.data),
      api.get('/payments').then(r => r.data),
      api.get('/evaluations').then(r => r.data),
      api.get('/classes').then(r => r.data),
      api.get('/events').then(r => r.data),
      api.get('/announcements').then(r => r.data),
    ]).then(([s, t, a, p, e, c, ev, an]) => {
      setStudents(s); setTeachers(t);
      setAttendances(a); setPayments(p);
      setEvaluations(e); setClasses(c);
      setEvents(ev); setAnnouncements(an);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const todayAttendance = useMemo(() => attendances.filter(a => a.date?.startsWith(today)), [attendances, today]);

  const attendanceStats = useMemo(() => {
    const all = todayAttendance.length || 1;
    const present = todayAttendance.filter(a => a.statut === 'present').length;
    const absent = todayAttendance.filter(a => a.statut === 'absent').length;
    const retard = todayAttendance.filter(a => a.statut === 'retard').length;
    return { present, absent, retard, total: todayAttendance.length, pctPresent: Math.round((present / all) * 100), pctAbsent: Math.round((absent / all) * 100), pctRetard: Math.round((retard / all) * 100) };
  }, [todayAttendance]);

  const paymentStats = useMemo(() => {
    const totalCollected = payments.reduce((s, p) => s + p.montant, 0);
    const uniqPayees = new Set(payments.filter(p => p.type === 'mensualite').map(p => p.eleve?._id)).size;
    const monthlyPayments = payments.filter(p => {
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      return p.mois === month;
    });
    const monthlyCollected = monthlyPayments.reduce((s, p) => s + p.montant, 0);
    const objectif = 3000000;
    const totalUnpaid = students.filter(s => s.actif).length - uniqPayees;
    return { totalCollected, objectif, pctAtteint: Math.min(100, Math.round((totalCollected / objectif) * 100)), uniqPayees, totalUnpaid: Math.max(0, totalUnpaid), monthlyCollected };
  }, [payments, students]);

  const classDistribution = useMemo(() => {
    const colors = ['#059669', '#4f46e5', '#d97706', '#0891b2', '#db2777', '#7c3aed', '#e11d48', '#0284c7'];
    return classes.map((c, i) => ({
      niveau: c.nom,
      count: students.filter(s => s.classe === c.nom).length,
      color: colors[i % colors.length],
    }));
  }, [classes, students]);

  const maxClassCount = Math.max(...classDistribution.map(c => c.count), 1);

  const recentEvals = useMemo(() => {
    return [...evaluations].reverse().slice(0, 5).map(e => {
      const avg = Math.round(((e.noteRecitation + e.noteTajwid) / 40) * 100);
      return { ...e, avg };
    });
  }, [evaluations]);

  const dashboardEvents = useMemo(() => events.map(e => ({
    day: String(new Date(e.date).getDate()).padStart(2, '0'),
    month: new Date(e.date).toLocaleString('fr', { month: 'short' }).toUpperCase(),
    title: e.titre,
    detail: new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  })), [events]);

  const dashboardAnnouncements = useMemo(() => announcements.map(a => ({
    badge: a.badge || 'Info',
    badgeBg: a.badge === 'Important' ? '#fef2f2' : a.badge === 'Urgent' ? '#fef2f2' : '#ecfdf5',
    badgeColor: a.badge === 'Important' || a.badge === 'Urgent' ? '#b91c1c' : '#0d7a5e',
    title: a.titre,
    text: a.contenu,
  })), [announcements]);

  if (loading) return <Layout><div className="loading"><div className="spinner"></div> Chargement...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard-welcome">
        <h1>Bienvenue, Admin</h1>
        <p>Voici un aperçu complet de la gestion de votre école coranique.</p>
      </div>

      {/* Row 1: 4 stat cards */}
      <div className="dash-cards-4">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: '#ecfdf5', color: '#0d7a5e' }}><i className="fa-solid fa-graduation-cap"></i></div>
          <div>
            <div className="dash-stat-value">{students.filter(s => s.actif).length}</div>
            <div className="dash-stat-label">Total élèves</div>
            <div className="dash-stat-sub"><i className="fa-solid fa-arrow-up" style={{ color: '#0d7a5e' }}></i> +{students.filter(s => s.dateInscription?.startsWith('2025')).length} cette année</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: '#f0faf5', color: '#0d7a5e' }}><i className="fa-solid fa-chalkboard-user"></i></div>
          <div>
            <div className="dash-stat-value">{teachers.filter(t => t.actif).length}</div>
            <div className="dash-stat-label">Total enseignants</div>
            <div className="dash-stat-sub">{teachers.filter(t => !t.actif).length} inactif{teachers.filter(t => !t.actif).length > 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: '#fffbeb', color: '#b8860b' }}><i className="fa-solid fa-check-circle"></i></div>
          <div>
            <div className="dash-stat-value">{attendanceStats.present}</div>
            <div className="dash-stat-label">Présents aujourd'hui</div>
            <div className="dash-stat-sub">{attendanceStats.total > 0 ? `Taux: ${attendanceStats.pctPresent}%` : 'Aucune donnée'}</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: '#fffbeb', color: '#b8860b' }}><i className="fa-solid fa-coins"></i></div>
          <div>
            <div className="dash-stat-value">{paymentStats.monthlyCollected.toLocaleString()} F</div>
            <div className="dash-stat-label">Paiements du mois</div>
            <div className="dash-stat-sub">{paymentStats.uniqPayees} payeurs</div>
          </div>
        </div>
      </div>

      {/* Row 2: 3 columns */}
      <div className="dash-grid-3">

        {/* Présences */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><i className="fa-solid fa-check-circle" style={{ color: '#0d7a5e' }}></i> Résumé des présences</h3>
            <Link to="/presences" className="dash-btn-link">Rapport <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }}></i></Link>
          </div>
          <div className="presences-numbers">
            <div className="presence-stat">
              <div className="presence-num">{attendanceStats.present}</div>
              <div className="presence-label green">Présents</div>
              <div className="presence-pct" style={{ color: '#0d7a5e' }}>{attendanceStats.pctPresent}%</div>
            </div>
            <div className="presence-stat">
              <div className="presence-num">{attendanceStats.absent}</div>
              <div className="presence-label red">Absents</div>
              <div className="presence-pct" style={{ color: '#b91c1c' }}>{attendanceStats.pctAbsent}%</div>
            </div>
            <div className="presence-stat">
              <div className="presence-num">{attendanceStats.retard}</div>
              <div className="presence-label orange">Retards</div>
              <div className="presence-pct" style={{ color: '#b8860b' }}>{attendanceStats.pctRetard}%</div>
            </div>
          </div>
          <div className="presence-bar-row">
            <div className="presence-bar-track">
              <div className="presence-bar-seg" style={{ width: `${attendanceStats.pctPresent}%`, background: '#0d7a5e' }}></div>
              <div className="presence-bar-seg" style={{ width: `${attendanceStats.pctAbsent}%`, background: '#b91c1c' }}></div>
              <div className="presence-bar-seg" style={{ width: `${attendanceStats.pctRetard}%`, background: '#b8860b' }}></div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            <i className="fa-solid fa-calendar-day"></i> {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Paiements */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><i className="fa-solid fa-coins" style={{ color: '#b8860b' }}></i> Suivi financier</h3>
            <Link to="/paiements" className="dash-btn-link">Détails <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }}></i></Link>
          </div>
          <div className="payment-main-row">
            <div className="payment-collected">
              <div className="payment-amount">{paymentStats.totalCollected.toLocaleString()} F</div>
              <div className="payment-sub">Total collecté</div>
            </div>
            <div className="payment-objectif">
              <div className="payment-amount-sm">{paymentStats.objectif.toLocaleString()} F</div>
              <div className="payment-sub">Objectif mensuel</div>
            </div>
          </div>
          <div className="payment-progress-row">
            <div className="payment-progress-bar">
              <div className="payment-progress-fill" style={{ width: `${paymentStats.pctAtteint}%` }}></div>
            </div>
            <span className="payment-progress-text">{paymentStats.pctAtteint}%</span>
          </div>
          <div className="payment-flag"><i className="fa-solid fa-flag"></i> {paymentStats.pctAtteint}% de l'objectif atteint</div>
          <div className="payment-stats">
            <div className="payment-stat-box" style={{ background: '#ecfdf5' }}>
              <div className="payment-stat-val" style={{ color: '#0d7a5e' }}>{paymentStats.uniqPayees}</div>
              <div className="payment-stat-label green">Élèves ayant payé</div>
            </div>
            <div className="payment-stat-box" style={{ background: '#fef2f2' }}>
              <div className="payment-stat-val" style={{ color: '#b91c1c' }}>{paymentStats.totalUnpaid}</div>
              <div className="payment-stat-label red">Élèves impayés</div>
            </div>
          </div>
        </div>

        {/* Répartition des classes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><i className="fa-solid fa-layer-group" style={{ color: '#0d7a5e' }}></i> Répartition des classes</h3>
            <Link to="/classes" className="dash-btn-link">Voir tout <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }}></i></Link>
          </div>
          <div className="class-distribution">
            {classDistribution.map(c => (
              <div className="class-item" key={c.niveau}>
                <div className="class-item-header">
                  <span className="class-level">{c.niveau}</span>
                  <span className="class-count">{c.count} élève{c.count > 1 ? 's' : ''}</span>
                </div>
                <div className="class-bar">
                  <div className="class-bar-fill" style={{ width: `${(c.count / maxClassCount) * 100}%`, background: c.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
            <i className="fa-solid fa-school"></i> {classes.length} classes · {classDistribution.reduce((s, c) => s + c.count, 0)} élèves répartis
          </div>
        </div>
      </div>

      {/* Row 3: 3 columns */}
      <div className="dash-grid-3">

        {/* Annonces */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><i className="fa-solid fa-bullhorn" style={{ color: '#b8860b' }}></i> Annonces importantes</h3>
            <button className="dash-btn-link">Gérer</button>
          </div>
          {dashboardAnnouncements.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>
              <i className="fa-solid fa-bullhorn" style={{ fontSize: 28, display: 'block', marginBottom: 8 }}></i>
              Aucune annonce
            </div>
          ) : dashboardAnnouncements.map((a, i) => (
            <div className="announce-item" key={i}>
              <span className="announce-badge" style={{ background: a.badgeBg, color: a.badgeColor }}>{a.badge}</span>
              <div className="announce-title">{a.title}</div>
              <div className="announce-text">{a.text}</div>
            </div>
          ))}
        </div>

        {/* Évaluations récentes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><i className="fa-solid fa-clipboard-check" style={{ color: '#0d7a5e' }}></i> Évaluations récentes</h3>
            <Link to="/evaluations" className="dash-btn-link">Voir tout <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }}></i></Link>
          </div>
          {recentEvals.length > 0 ? recentEvals.map(e => (
            <div className="eval-item" key={e._id}>
              <div className="eval-icon" style={{ background: e.avg >= 80 ? '#ecfdf5' : e.avg >= 70 ? '#fffbeb' : '#fef2f2', color: e.avg >= 80 ? '#0d7a5e' : e.avg >= 70 ? '#b8860b' : '#b91c1c' }}>
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="eval-content">
                <div className="eval-name">{e.eleve?.prenom} {e.eleve?.nom}</div>
                <div className="eval-detail">{e.niveau} · {e.sourate}</div>
              </div>
              <div className={`eval-score ${e.avg >= 75 ? 'green' : 'orange'}`}>{e.avg}%</div>
            </div>
          )) : (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>
              <i className="fa-solid fa-file-circle-plus" style={{ fontSize: 28, display: 'block', marginBottom: 8 }}></i>
              Aucune évaluation récente
            </div>
          )}
          {(recentEvals.length > 0) && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
              <i className="fa-solid fa-chart-simple"></i> Moyenne générale: {Math.round(recentEvals.reduce((s, e) => s + e.avg, 0) / recentEvals.length)}%
            </div>
          )}
        </div>

        {/* Calendrier */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><i className="fa-solid fa-calendar-days" style={{ color: '#0d7a5e' }}></i> Calendrier des événements</h3>
            <button className="dash-btn-link">Ajouter</button>
          </div>
          {dashboardEvents.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>
              <i className="fa-solid fa-calendar-plus" style={{ fontSize: 28, display: 'block', marginBottom: 8 }}></i>
              Aucun événement
            </div>
          ) : dashboardEvents.slice(0, 4).map((ev, i) => (
            <div className="cal-event" key={i}>
              <div className="cal-date">
                <div className="cal-day">{ev.day}</div>
                <div className="cal-month">{ev.month}</div>
              </div>
              <div className="cal-content">
                <div className="cal-title">{ev.title}</div>
                <div className="cal-detail">{ev.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 4px', color: '#9ca3af', fontSize: 13, borderTop: '1px solid #e8e4db', marginTop: 6 }}>
        <span>Année scolaire 2025 - 2026</span>
        <span><i className="fa-solid fa-database"></i> {students.length} élèves · {teachers.length} enseignants · {payments.length} paiements · {evaluations.length} évaluations</span>
      </div>
    </Layout>
  );
};

export default Dashboard;
