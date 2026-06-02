import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import Avatar from '../../components/Common/Avatar';
import { useToast } from '../../components/Common/Toast';
import api from '../../api/axios';

const STATUTS = ['present', 'absent', 'retard', 'justifie'];
const STATUT_LABELS = { present: 'Présent', absent: 'Absent', retard: 'Retard', justifie: 'Justifié' };
const STATUT_COLORS = { present: '#059669', absent: '#dc2626', retard: '#d97706', justifie: '#4f46e5' };
const STATUT_ICONS = { present: 'fa-check-circle', absent: 'fa-times-circle', retard: 'fa-clock', justifie: 'fa-check-double' };

const AttendancePage = () => {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [type, setType] = useState('eleve');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreClasse, setFiltreClasse] = useState('');
  const [monthlyAbsences, setMonthlyAbsences] = useState({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/students?actif=true'),
      api.get('/teachers?actif=true'),
      api.get('/classes')
    ]).then(([s, t, c]) => {
      setStudents(s.data);
      setTeachers(t.data);
      setClasses(c.data);
    }).catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (date) {
      api.get(`/attendance?date=${date}&type=${type}`)
        .then(res => {
          const map = {};
          res.data.forEach(a => {
            const key = type === 'eleve' ? a.eleve?._id : a.enseignant?._id;
            if (key) map[key] = a.statut;
          });
          setAttendance(map);
        }).catch(() => {});
    }
  }, [date, type]);

  useEffect(() => {
    if (type === 'eleve') {
      const d = new Date(date);
      const mois = d.getMonth() + 1;
      const annee = d.getFullYear();
      api.get(`/attendance?mois=${mois}&annee=${annee}&type=eleve`)
        .then(res => {
          const counts = {};
          res.data.forEach(a => {
            if (a.statut === 'absent' && a.eleve?._id) {
              counts[a.eleve._id] = (counts[a.eleve._id] || 0) + 1;
            }
          });
          setMonthlyAbsences(counts);
        }).catch(() => {});
    } else {
      setMonthlyAbsences({});
    }
  }, [date, type]);

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus ? STATUTS[(STATUTS.indexOf(currentStatus) + 1) % STATUTS.length] : 'present';
    setAttendance(prev => ({ ...prev, [id]: nextStatus }));
    setSaving(true);
    try {
      const payload = { date, type, statut: nextStatus };
      if (type === 'eleve') payload.eleveId = id;
      else payload.enseignantId = id;
      await api.post('/attendance', payload);
      const res = await api.get(`/attendance?date=${date}&type=${type}`);
      const map = {};
      res.data.forEach(a => {
        const key = type === 'eleve' ? a.eleve?._id : a.enseignant?._id;
        if (key) map[key] = a.statut;
      });
      setAttendance(map);
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
      setAttendance(prev => ({ ...prev, [id]: currentStatus }));
    }
    setSaving(false);
  };

  const list = type === 'eleve' ? students : teachers;

  const filtered = list.filter(item => {
    if (filtreStatut && (attendance[item._id] || 'non') !== filtreStatut) return false;
    if (type === 'eleve' && filtreClasse && item.classe !== filtreClasse) return false;
    return true;
  });

  const stats = useMemo(() => {
    const values = Object.values(attendance);
    return {
      present: values.filter(v => v === 'present').length,
      absent: values.filter(v => v === 'absent').length,
      retard: values.filter(v => v === 'retard').length,
      justifie: values.filter(v => v === 'justifie').length,
      nonMarque: list.length - values.length,
    };
  }, [attendance, list.length]);

  return (
    <Layout>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 style={{ fontSize: 18, letterSpacing: 1, color: '#0a2e2a' }}>GESTION DES PRÉSENCES</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="stu-filter-group" style={{ marginBottom: 0 }}>
            <i className="fa-solid fa-calendar-day"></i>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 150 }} />
          </div>
          <div className="stu-filter-group" style={{ marginBottom: 0 }}>
            <select value={type} onChange={e => { setType(e.target.value); setFiltreClasse(''); setFiltreStatut(''); }}>
              <option value="eleve">Élèves</option>
              <option value="enseignant">Enseignants</option>
            </select>
          </div>
          {type === 'eleve' && (
            <div className="stu-filter-group" style={{ marginBottom: 0 }}>
              <i className="fa-solid fa-layer-group"></i>
              <select value={filtreClasse} onChange={e => setFiltreClasse(e.target.value)} style={{ minWidth: 160 }}>
                <option value="">Toutes les classes</option>
                {classes.map(c => (
                  <option key={c._id || c.nom} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>
          )}
          {saving && <span style={{ color: '#059669', fontSize: 13 }}><i className="fa-solid fa-spinner fa-spin"></i> Sauvegarde...</span>}
        </div>
      </div>

      <div className="stu-stats">
        <div className="stu-stat-card" style={{ borderTopColor: '#059669', cursor: 'pointer' }} onClick={() => setFiltreStatut(filtreStatut === 'present' ? '' : 'present')}>
          <div className="stu-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.present}</div>
            <div className="stu-stat-label">Présents</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#dc2626', cursor: 'pointer' }} onClick={() => setFiltreStatut(filtreStatut === 'absent' ? '' : 'absent')}>
          <div className="stu-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <i className="fa-solid fa-times-circle"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.absent}</div>
            <div className="stu-stat-label">Absents</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#d97706', cursor: 'pointer' }} onClick={() => setFiltreStatut(filtreStatut === 'retard' ? '' : 'retard')}>
          <div className="stu-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.retard}</div>
            <div className="stu-stat-label">Retards</div>
          </div>
        </div>
        <div className="stu-stat-card" style={{ borderTopColor: '#4f46e5', cursor: 'pointer' }} onClick={() => setFiltreStatut(filtreStatut === 'justifie' ? '' : 'justifie')}>
          <div className="stu-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <i className="fa-solid fa-check-double"></i>
          </div>
          <div>
            <div className="stu-stat-value">{stats.justifie}</div>
            <div className="stu-stat-label">Justifiés</div>
          </div>
        </div>
      </div>

      {filtreStatut && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#78716c' }}>
            Filtre: <strong style={{ color: STATUT_COLORS[filtreStatut] }}>{STATUT_LABELS[filtreStatut]}</strong>
          </span>
          <button className="btn btn-sm" style={{ background: '#f1f0ed', color: '#57534e', padding: '3px 10px', fontSize: 12 }} onClick={() => setFiltreStatut('')}>
            <i className="fa-solid fa-rotate"></i> Réinitialiser
          </button>
        </div>
      )}

      {loading ? <Loading /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="col-photo" style={{ width: 44 }}></th>
                <th className="col-nom">Nom complet</th>
                {type === 'eleve' &&                 <th className="col-niveau">Niveau</th>}
                {type === 'eleve' && <th className="col-classe">Classe</th>}
                {type === 'eleve' && <th className="col-absences" style={{ textAlign: 'center' }}>Absences<br/><span style={{ fontWeight: 400, fontSize: 11 }}>ce mois</span></th>}
                <th className="col-presence">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const status = attendance[item._id];
                return (
                  <tr key={item._id}>
                    <td><Avatar nom={item.nom} prenom={item.prenom} photo={item.photo} size={34} /></td>
                    <td style={{ fontWeight: 600 }}>{item.nom} {item.prenom}</td>
                    {type === 'eleve' && <td><span className="badge" style={{ background: '#059669' }}>{item.niveauCoranique || 'N/A'}</span></td>}
                    {type === 'eleve' && <td style={{ fontSize: 13, color: '#57534e' }}>{item.classe || '—'}</td>}
                    {type === 'eleve' && (
                      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, color: (monthlyAbsences[item._id] || 0) >= 3 ? '#dc2626' : (monthlyAbsences[item._id] || 0) > 0 ? '#d97706' : '#059669' }}>
                        {monthlyAbsences[item._id] || 0}
                      </td>
                    )}
                    <td>
                      <button
                        onClick={() => toggleStatus(item._id, status)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '5px 14px', borderRadius: 20, border: '1.5px solid',
                          borderColor: status ? STATUT_COLORS[status] : '#d4d4d4',
                          background: status ? `${STATUT_COLORS[status]}10` : '#f9f9f9',
                          color: status ? STATUT_COLORS[status] : '#78716c',
                          cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                        title="Cliquer pour changer le statut"
                      >
                        <i className={`fa-solid ${status ? STATUT_ICONS[status] : 'fa-circle'}`} style={{ fontSize: 11 }}></i>
                        {status ? STATUT_LABELS[status] : 'Marquer'}
                        {status && <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, opacity: 0.5, marginLeft: 2 }}></i>}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                  <i className="fa-solid fa-users-slash" style={{ fontSize: 28, marginBottom: 8, display: 'block' }}></i>
                  {filtreStatut ? `Aucun ${type} avec le statut "${filtreStatut}"` : `Aucun ${type} trouvé`}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default AttendancePage;
