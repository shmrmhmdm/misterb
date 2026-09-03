import React from 'react';

const MisterBLogo = ({ size = 'normal', showSubtitle = true }) => {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      textAlign: 'center',
      padding: '10px 0'
    }}>
      {/* Royal Crown Accent SVG */}
      <div style={{
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 4px 12px rgba(250, 204, 21, 0.45))'
      }}>
        <svg
          viewBox="0 0 60 30"
          width="48px"
          height="24px"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="royalGoldGrad" x1="0" y1="0" x2="60" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          {/* Royal Crown Peaks */}
          <path
            d="M6 26L12 8L22 17L30 5L38 17L48 8L54 26H6Z"
            fill="url(#royalGoldGrad)"
            stroke="#fef9c3"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Jewels */}
          <circle cx="12" cy="8" r="2" fill="#ffffff" />
          <circle cx="30" cy="5" r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="48" cy="8" r="2" fill="#ffffff" />
          {/* Crown Base */}
          <rect x="8" y="24" width="44" height="3.5" rx="1.5" fill="#ca8a04" />
          <circle cx="20" cy="25.75" r="1" fill="#fef08a" />
          <circle cx="30" cy="25.75" r="1.2" fill="#ffffff" />
          <circle cx="40" cy="25.75" r="1" fill="#fef08a" />
        </svg>
      </div>

      {/* Royal Serif Text "Mister B" */}
      <div style={{ position: 'relative' }}>
        <h1 style={{
          margin: 0,
          fontFamily: "'Cinzel', 'Playfair Display', 'Georgia', 'Times New Roman', serif",
          fontSize: size === 'large' ? '2.8rem' : '2.4rem',
          fontWeight: '800',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #ffffff 0%, #fef08a 25%, #facc15 50%, #eab308 75%, #ca8a04 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 16px rgba(250, 204, 21, 0.35))',
          lineHeight: '1.1'
        }}>
          Mister B
        </h1>

        {/* Decorative Royal Divider Line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '6px',
          marginBottom: '4px'
        }}>
          <div style={{ height: '1px', width: '36px', background: 'linear-gradient(90deg, transparent, #eab308)' }} />
          <div style={{ width: '5px', height: '5px', transform: 'rotate(45deg)', background: '#facc15', boxShadow: '0 0 6px #facc15' }} />
          <div style={{ height: '1px', width: '36px', background: 'linear-gradient(90deg, #eab308, transparent)' }} />
        </div>
      </div>

      {showSubtitle && (
        <span style={{
          fontFamily: "'Cinzel', 'Inter', 'Montserrat', sans-serif",
          fontSize: '0.75rem',
          fontWeight: '600',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(254, 240, 138, 0.85)',
          marginTop: '2px'
        }}>
          Royal Beverages
        </span>
      )}
    </div>
  );
};

export default MisterBLogo;
