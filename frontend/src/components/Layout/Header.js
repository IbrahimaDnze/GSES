import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useSocket();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const handleClick = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={dropdownRef} className="notif-dropdown">
      <div className="notif-dropdown-header">
        <span>Notifications</span>
        {notifications.filter(n => !n.lu).length > 0 && (
          <button className="notif-mark-all" onClick={markAllAsRead}>Tout marquer lu</button>
        )}
      </div>
      <div className="notif-dropdown-body">
        {notifications.length === 0 ? (
          <div className="notif-empty">Aucune notification</div>
        ) : notifications.slice(0, 20).map(n => (
          <div key={n._id} className={`notif-item ${n.lu ? '' : 'notif-unread'}`} onClick={() => { if (!n.lu) markAsRead(n._id); }}>
            <div className="notif-icon">
              <i className={`fa-solid ${n.type === 'annonce' ? 'fa-bullhorn' : 'fa-circle-info'}`}></i>
            </div>
            <div className="notif-content">
              <div className="notif-message">{n.message}</div>
              <div className="notif-time">{new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            {!n.lu && <div className="notif-dot"></div>}
          </div>
        ))}
        <div className="notif-view-all" onClick={() => { window.location.href = '/annonces'; onClose(); }}>
          Voir toutes les annonces
        </div>
      </div>
    </div>
  );
};

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="topbar-search">
          <i className="fa-solid fa-search"></i>
          <input type="text" placeholder="Rechercher..." />
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-icon" ref={notifRef} onClick={() => setNotifOpen(!notifOpen)}>
          <i className="fa-solid fa-bell"></i>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
        </div>
        <div className="topbar-divider"></div>
        <div className="topbar-profile" ref={ref} onClick={() => setOpen(!open)}>
          <div className="topbar-avatar">
            {user?.photo ? (
              <img src={`http://localhost:5001/uploads/${user.photo}`} alt="" />
            ) : (
              user?.nom?.charAt(0)?.toUpperCase() || 'A'
            )}
          </div>
          <div className="topbar-profile-info">
            <span className="topbar-profile-name">{user?.nom || 'Administrateur'}</span>
            <span className="topbar-profile-role">
              {user?.role === 'admin' ? 'Administrateur' :
               user?.role === 'directeur' ? 'Directeur' :
               user?.role === 'enseignant' ? 'Enseignant' : 'Comptable'}
            </span>
          </div>
          {open && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-item" onClick={() => { setOpen(false); navigate('/profil'); }}>
                <i className="fa-solid fa-user-circle"></i>
                <span>Mon Profil</span>
              </div>
              <div className="topbar-dropdown-divider"></div>
              <div className="topbar-dropdown-item" onClick={() => { setOpen(false); navigate('/annonces'); }}>
                <i className="fa-solid fa-bullhorn"></i>
                <span>Annonces</span>
              </div>
              <div className="topbar-dropdown-divider"></div>
              <div className="topbar-dropdown-item topbar-dropdown-danger" onClick={handleLogout}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Déconnexion</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
