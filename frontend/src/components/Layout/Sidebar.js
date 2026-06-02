import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../Common/Avatar';

const Sidebar = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          {settings?.logo ? <img src={`http://localhost:5001/uploads/${settings.logo}`} alt="Logo" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover' }} /> : <i className="fa-solid fa-quran"></i>}
        </div>
        <div>
          <h2>{settings?.nomEcole || 'École Coranique'}</h2>
          <p>Gestion Scolaire</p>
        </div>
      </div>

      <div className="sidebar-nav-wrap">
        <div className="sidebar-section-title">MENU PRINCIPAL</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-gauge-high"></i>
              <span>Tableau de bord</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/eleves" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-graduation-cap"></i>
              <span>Élèves</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/enseignants" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-chalkboard-user"></i>
              <span>Enseignants</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/classes" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-school"></i>
              <span>Classes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/presences" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-check"></i>
              <span>Présences</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/paiements" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-money-bill-transfer"></i>
              <span>Paiements</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/evaluations" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-book-quran"></i>
              <span>Évaluations</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/calendrier" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-calendar-days"></i>
              <span>Calendrier</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/cartes" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-id-card"></i>
              <span>Cartes</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-section-title">PARAMÈTRES</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/profil" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-user-circle"></i>
              <span>Profil</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/utilisateurs" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-users"></i>
              <span>Utilisateurs</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/parametres" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fa-solid fa-gear"></i>
              <span>Paramètres</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/profil" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="sidebar-user">
            <Avatar nom={user?.nom} prenom="" photo={user?.photo} size={36} />
            <div>
              <p className="sidebar-user-name">{user?.nom || 'Utilisateur'}</p>
              <p className="sidebar-user-role">
                {user?.role === 'admin' ? 'Administrateur' :
                 user?.role === 'directeur' ? 'Directeur' :
                 user?.role === 'enseignant' ? 'Enseignant' : 'Comptable'}
              </p>
            </div>
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
