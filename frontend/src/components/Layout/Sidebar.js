import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../config';
import Avatar from '../Common/Avatar';

const menuItems = {
  principal: [
    { to: '/', label: 'Tableau de bord', icon: 'fa-gauge-high', roles: ['admin', 'directeur', 'comptable'] },
    { to: '/eleves', label: 'Élèves', icon: 'fa-graduation-cap', roles: ['admin', 'directeur', 'enseignant'] },
    { to: '/enseignants', label: 'Enseignants', icon: 'fa-chalkboard-user', roles: ['admin', 'directeur'] },
    { to: '/classes', label: 'Classes', icon: 'fa-school', roles: ['admin', 'directeur'] },
    { to: '/presences', label: 'Présences', icon: 'fa-check', roles: ['admin', 'directeur', 'enseignant'] },
    { to: '/paiements', label: 'Paiements', icon: 'fa-money-bill-transfer', roles: ['admin', 'directeur', 'comptable'] },
    { to: '/evaluations', label: 'Évaluations', icon: 'fa-book-quran', roles: ['admin', 'directeur', 'enseignant'] },
    { to: '/annonces', label: 'Annonces', icon: 'fa-bullhorn', roles: ['admin', 'directeur'] },
    { to: '/calendrier', label: 'Calendrier', icon: 'fa-calendar-days', roles: ['admin', 'directeur'] },
    { to: '/cartes', label: 'Cartes', icon: 'fa-id-card', roles: ['admin', 'directeur'] },
  ],
  parametres: [
    { to: '/profil', label: 'Profil', icon: 'fa-user-circle', roles: ['admin', 'directeur', 'comptable', 'enseignant'] },
    { to: '/utilisateurs', label: 'Utilisateurs', icon: 'fa-users', roles: ['admin', 'directeur'] },
    { to: '/parametres', label: 'Paramètres', icon: 'fa-gear', roles: ['admin', 'directeur'] },
  ],
};

const Sidebar = ({ onClose }) => {
  const { settings } = useSettings();
  const { user } = useAuth();

  const filtered = useMemo(() => {
    const role = user?.role || '';
    return {
      principal: menuItems.principal.filter(m => m.roles.includes(role)),
      parametres: menuItems.parametres.filter(m => m.roles.includes(role)),
    };
  }, [user?.role]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            {settings?.logo ? <img src={getImageUrl(settings.logo)} alt="Logo" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover' }} /> : <i className="fa-solid fa-quran"></i>}
          </div>
          <div>
            <h2>{settings?.nomEcole || 'École Coranique'}</h2>
            <p>Gestion Scolaire</p>
          </div>
        </div>
        <button className="sidebar-close" onClick={onClose}>&times;</button>
      </div>

      <div className="sidebar-nav-wrap">
        <div className="sidebar-section-title">MENU PRINCIPAL</div>
        <ul className="sidebar-nav">
          {filtered.principal.map(m => (
            <li key={m.to}>
              <NavLink to={m.to} end={m.to === '/'} className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                <i className={`fa-solid ${m.icon}`}></i>
                <span>{m.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {filtered.parametres.length > 0 && (
          <>
            <div className="sidebar-section-title">PARAMÈTRES</div>
            <ul className="sidebar-nav">
              {filtered.parametres.map(m => (
                <li key={m.to}>
                  <NavLink to={m.to} className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                    <i className={`fa-solid ${m.icon}`}></i>
                    <span>{m.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
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
