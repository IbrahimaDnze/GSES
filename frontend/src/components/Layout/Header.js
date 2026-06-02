import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-search">
          <i className="fa-solid fa-search"></i>
          <input type="text" placeholder="Rechercher un élève, un enseignant..." />
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-icon">
          <i className="fa-solid fa-bell"></i>
        </div>
        <div className="topbar-divider"></div>
        <div className="topbar-profile" ref={ref} onClick={() => setOpen(!open)} style={{ cursor: 'pointer', position: 'relative', userSelect: 'none' }}>
          <div className="topbar-avatar" style={{ background: '#1E3B2E' }}>
            {user?.photo ? (
              <img src={`http://localhost:5001/uploads/${user.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
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
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              minWidth: 200, zIndex: 200, overflow: 'hidden', border: '1px solid #f1f0ed'
            }}>
              <div onClick={() => { setOpen(false); navigate('/profil'); }} style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', fontSize: 14, color: '#1a1a2e', transition: 'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f4'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <i className="fa-solid fa-user-circle" style={{ width: 18, color: '#57534e' }}></i>
                <span>Mon Profil</span>
              </div>
              <div style={{ height: 1, background: '#f1f0ed', margin: '0 12px' }}></div>
              <div onClick={handleLogout} style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', fontSize: 14, color: '#dc2626', transition: 'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: 18 }}></i>
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
