import React from 'react';

const Header = () => {
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
          <span className="topbar-badge">3</span>
        </div>
        <div className="topbar-icon">
          <i className="fa-solid fa-envelope"></i>
          <span className="topbar-badge">2</span>
        </div>
        <div className="topbar-divider"></div>
        <div className="topbar-profile">
          <div className="topbar-avatar">A</div>
          <div className="topbar-profile-info">
            <span className="topbar-profile-name">Administrateur</span>
            <span className="topbar-profile-role">Super Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
