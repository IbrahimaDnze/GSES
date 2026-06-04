import React from 'react';
import { getImageUrl } from '../../config';

const colors = [
  '#059669', '#d97706', '#dc2626', '#4f46e5', '#db2777',
  '#0891b2', '#7c3aed', '#ca8a04', '#65a30d', '#0d9488',
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(nom, prenom) {
  const n = (nom || '')[0] || '';
  const p = (prenom || '')[0] || '';
  return (n + p).toUpperCase() || '?';
}

const Avatar = ({ nom, prenom, photo, size = 40, fontSize, style }) => {
  const bg = getColor(`${nom}${prenom}`);
  const initials = getInitials(nom, prenom);

  if (photo) {
    return (
      <img
        src={getImageUrl(photo)}
        alt={`${nom} ${prenom}`}
        style={{
          width: size,
          height: size,
          borderRadius: '10px',
          objectFit: 'cover',
          flexShrink: 0,
          ...style,
        }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '10px',
        background: `linear-gradient(135deg, ${bg}, ${bg}dd)`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: fontSize || (size > 36 ? 16 : 12),
        flexShrink: 0,
        boxShadow: `0 2px 8px ${bg}40`,
        ...style,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
