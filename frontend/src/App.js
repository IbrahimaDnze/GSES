import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Common/Toast';
import { SettingsProvider } from './context/SettingsContext';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/students/StudentList';
import StudentForm from './pages/students/StudentForm';
import StudentDetail from './pages/students/StudentDetail';
import TeacherList from './pages/teachers/TeacherList';
import TeacherForm from './pages/teachers/TeacherForm';
import ClassList from './pages/classes/ClassList';
import AttendancePage from './pages/attendance/AttendancePage';
import PaymentList from './pages/payments/PaymentList';
import EvaluationPage from './pages/evaluations/EvaluationPage';
import ReportsPage from './pages/reports/ReportsPage';
import UserList from './pages/users/UserList';
import Calendrier from './pages/Calendrier';
import Cartes from './pages/Cartes';
import Parametres from './pages/Parametres';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <ToastProvider><SettingsProvider><Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/eleves" element={<StudentList />} />
      <Route path="/eleves/ajouter" element={<StudentForm />} />
      <Route path="/eleves/modifier/:id" element={<StudentForm />} />
      <Route path="/eleves/:id" element={<StudentDetail />} />
      <Route path="/enseignants" element={<TeacherList />} />
      <Route path="/enseignants/ajouter" element={<TeacherForm />} />
      <Route path="/enseignants/modifier/:id" element={<TeacherForm />} />
      <Route path="/classes" element={<ClassList />} />
      <Route path="/presences" element={<AttendancePage />} />
      <Route path="/paiements" element={<PaymentList />} />
      <Route path="/evaluations" element={<EvaluationPage />} />
      <Route path="/rapports" element={<ReportsPage />} />
      <Route path="/utilisateurs" element={<UserList />} />
      <Route path="/calendrier" element={<Calendrier />} />
      <Route path="/cartes" element={<Cartes />} />
      <Route path="/parametres" element={<Parametres />} />
      <Route path="/profil" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Dashboard />} />
    </Routes></SettingsProvider></ToastProvider>
  );
}

export default App;
