import React, { useState } from 'react';
import { formatDriveImageUrl } from '../utils/imageHelper';

const UserAvatar = ({ photo, name = 'User', size = 42, role = '' }) => {
  const [imgError, setImgError] = useState(false);
  const formattedUrl = formatDriveImageUrl(photo);

  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  // If valid photo exists and didn't error
  if (formattedUrl && !imgError) {
    return (
      <img
        src={formattedUrl}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--accent-primary)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          flexShrink: 0
        }}
      />
    );
  }

  // Fallback initial badge
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${size * 0.28}px`,
      background: 'var(--accent-gradient)',
      color: '#fff',
      fontWeight: '700',
      fontSize: `${size * 0.42}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
      flexShrink: 0
    }}>
      {initial}
    </div>
  );
};

export default UserAvatar;
