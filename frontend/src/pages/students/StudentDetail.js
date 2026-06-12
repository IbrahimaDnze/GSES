import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/Common/Loading';
import Avatar from '../../components/Common/Avatar';
import api from '../../api/axios';

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/students/${id}`),
      api.get(`/evaluations?eleve=${id}`),
      api.get(`/payments?eleve=${id}`)
    ]).then(([s, e, p]) => {
      setStudent(s.data);
      setEvaluations(e.data);
      setPayments(p.data);
    }).catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout title="Details Eleve"><Loading /></Layout>;
  if (!student) return <Layout title="Details Eleve"><p>Eleve non trouve</p></Layout>;

  return (
    <Layout title={`${student.nom} ${student.prenom}`}>
      <div className="sd-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', padding: 22, borderRadius: 14, border: '1px solid #f1f0ed' }}>
          <h3 style={{ color: '#0a2e2a', marginBottom: 15, fontSize: 15 }}>Informations</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Avatar nom={student.nom} prenom={student.prenom} photo={student.photo} size={72} fontSize={28} />
            <div>
              <h2 style={{ fontSize: 20, color: '#0a2e2a', marginBottom: 2 }}>{student.nom} {student.prenom}</h2>
              <span className="badge badge-present" style={{ fontSize: 12 }}>{student.niveauCoranique}</span>
            </div>
          </div>
          <div className="sd-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
            <p style={{ fontSize: 13.5, color: '#57534e' }}><strong style={{ color: '#0a2e2a' }}>Date naissance:</strong> {student.dateNaissance ? new Date(student.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'}</p>
            <p style={{ fontSize: 13.5, color: '#57534e' }}><strong style={{ color: '#0a2e2a' }}>Sexe:</strong> {student.sexe}</p>
            <p style={{ fontSize: 13.5, color: '#57534e' }}><strong style={{ color: '#0a2e2a' }}>Tuteur:</strong> {student.nomTuteur}</p>
            <p style={{ fontSize: 13.5, color: '#57534e' }}><strong style={{ color: '#0a2e2a' }}>Contact:</strong> {student.contactParent}</p>
            <p style={{ fontSize: 13.5, color: '#57534e' }}><strong style={{ color: '#0a2e2a' }}>Adresse:</strong> {student.adresse || 'N/A'}</p>
            <p style={{ fontSize: 13.5, color: '#57534e' }}><strong style={{ color: '#0a2e2a' }}>Inscription:</strong> {new Date(student.dateInscription).toLocaleDateString('fr-FR')}</p>
          </div>
          <Link to={`/eleves/modifier/${student._id}`} className="btn btn-warning" style={{ marginTop: 18 }}><i className="fa-solid fa-edit"></i> Modifier</Link>
        </div>
        <div>
          <div style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #f1f0ed', marginBottom: 20 }}>
            <h3 style={{ color: '#0a2e2a', marginBottom: 15, fontSize: 15 }}><i className="fa-solid fa-book-quran" style={{ color: '#059669', marginRight: 8 }}></i>Évaluations coraniques</h3>
            {evaluations.length === 0 ? <p style={{ color: '#999' }}>Aucune evaluation</p> : (
              <table>
                <thead><tr><th>Sourate</th><th>Recitation</th><th>Tajwid</th><th>Date</th></tr></thead>
                <tbody>
                  {evaluations.map(e => (
                    <tr key={e._id}>
                      <td>{e.sourate}</td>
                      <td>{e.noteRecitation}/10</td>
                      <td>{e.noteTajwid}/10</td>
                      <td>{new Date(e.dateEvaluation).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #f1f0ed' }}>
            <h3 style={{ color: '#0a2e2a', marginBottom: 15, fontSize: 15 }}><i className="fa-solid fa-coins" style={{ color: '#d97706', marginRight: 8 }}></i>Paiements</h3>
            {payments.length === 0 ? <p style={{ color: '#999' }}>Aucun paiement</p> : (
              <table>
                <thead><tr><th>Type</th><th>Montant</th><th>Mois</th><th>Date</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td>{p.type}</td>
                      <td>{p.montant.toLocaleString()} Fcfa</td>
                      <td>{p.mois ? `${p.mois}/${p.annee}` : '-'}</td>
                      <td>{new Date(p.datePaiement).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDetail;
