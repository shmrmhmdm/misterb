import React from 'react';

const MisterBLogo = ({ size = 88, showText = false, glow = true }) => {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: `${size * 0.3}px`,
        background: 'radial-gradient(circle at 50% 40%, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        boxShadow: glow 
          ? '0 10px 30px rgba(56, 189, 248, 0.35), 0 0 25px rgba(6, 182, 212, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.25)' 
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Background Bubbles and Neon Aura */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '20%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, transparent 70%)',
          filter: 'blur(10px)',
          pointerEvents: 'none'
        }} />
        
        {/* Floating Bubble Accents */}
        <div style={{ position: 'absolute', width: '5px', height: '5px', borderRadius: '50%', background: '#38bdf8', top: '25%', left: '20%', opacity: 0.7, boxShadow: '0 0 6px #38bdf8' }} />
        <div style={{ position: 'absolute', width: '4px', height: '4px', borderRadius: '50%', background: '#67e8f9', top: '40%', right: '22%', opacity: 0.8, boxShadow: '0 0 6px #67e8f9' }} />
        <div style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', bottom: '25%', left: '26%', opacity: 0.6, boxShadow: '0 0 8px #38bdf8' }} />
        <div style={{ position: 'absolute', width: '3px', height: '3px', borderRadius: '50%', background: '#a5f3fc', top: '18%', right: '30%', opacity: 0.9 }} />

        {/* Soda Bottle Vector Graphic */}
        <svg
          viewBox="0 0 100 100"
          width={`${size * 0.72}px`}
          height={`${size * 0.72}px`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6))' }}
        >
          <defs>
            <linearGradient id="bottleGlass" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="30%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            <linearGradient id="capGradient" x1="40" y1="6" x2="60" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="liquidShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="badgeGradient" x1="32" y1="42" x2="68" y2="74" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* Refreshing Splash Waves around bottle */}
          <path
            d="M20 54C16 52 14 47 17 44C20 41 24 45 28 49M80 54C84 52 86 47 83 44C80 41 76 45 72 49"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Bottle Crown Cap */}
          <path
            d="M44 8H56C57.5 8 58 9 58 10.5C58 12 56.5 13 55 13H45C43.5 13 42 12 42 10.5C42 9 42.5 8 44 8Z"
            fill="url(#capGradient)"
            stroke="#e0f2fe"
            strokeWidth="0.8"
          />

          {/* Bottle Body */}
          <path
            d="M45 13H55V24C55 27 67 36 67 48V84C67 88 64 91 60 91H40C36 91 33 88 33 84V48C33 36 45 27 45 24V13Z"
            fill="url(#bottleGlass)"
            stroke="#bae6fd"
            strokeWidth="1.2"
          />

          {/* Bottle Highlight / Glass Reflection */}
          <path
            d="M36 48C36 38 46 29 46 24V14H48V24C48 28 39 37 39 48V83C39 86 40 88 41 89H38C35 89 36 86 36 83V48Z"
            fill="url(#liquidShine)"
          />

          {/* Bottle Label Shield */}
          <path
            d="M37 46H63C65 46 66 47 66 49V68C66 76 50 82 50 82C50 82 34 76 34 68V49C34 47 35 46 37 46Z"
            fill="url(#badgeGradient)"
            stroke="#38bdf8"
            strokeWidth="1.2"
          />

          {/* Crown on top of 'B' */}
          <path
            d="M44 53L42 58H58L56 53L50 56L44 53Z"
            fill="#38bdf8"
          />

          {/* Letter 'B' Monogram on Label */}
          <path
            d="M45 59H52C54.5 59 56 60.5 56 62.5C56 64 55 65 53.5 65.5C55.5 66 56.5 67.5 56.5 69.5C56.5 72 54.5 73.5 52 73.5H45V59ZM48 64.5H51.5C52.5 64.5 53.5 64 53.5 63C53.5 62 52.5 61.5 51.5 61.5H48V64.5ZM48 71H52C53 71 54 70.5 54 69.5C54 68.5 53 68 52 68H48V71Z"
            fill="#ffffff"
          />

          {/* Effervescent Internal Bubbles */}
          <circle cx="42" cy="78" r="1.2" fill="#e0f2fe" opacity="0.8" />
          <circle cx="56" cy="76" r="1" fill="#e0f2fe" opacity="0.7" />
          <circle cx="48" cy="85" r="1.5" fill="#e0f2fe" opacity="0.9" />
          <circle cx="53" cy="83" r="0.8" fill="#e0f2fe" opacity="0.8" />
        </svg>
      </div>

      {showText && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block'
          }}>
            Mister B Soda
          </span>
        </div>
      )}
    </div>
  );
};

export default MisterBLogo;
