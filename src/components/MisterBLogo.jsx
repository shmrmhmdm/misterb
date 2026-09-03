import React from 'react';

const MisterBLogo = ({ size = 80, showText = false, glow = true }) => {
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
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1.5px solid rgba(59, 130, 246, 0.35)',
        boxShadow: glow 
          ? '0 10px 30px rgba(59, 130, 246, 0.35), 0 0 20px rgba(99, 102, 241, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)' 
          : '0 4px 12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Glow Accent */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-20%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
          pointerEvents: 'none'
        }} />

        {/* Vector 3D 'B' Logo SVG */}
        <svg
          viewBox="0 0 100 100"
          width={`${size * 0.65}px`}
          height={`${size * 0.65}px`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))' }}
        >
          <defs>
            <linearGradient id="misterBGloss" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#3b82f6" />
              <stop offset="80%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            
            <linearGradient id="innerShine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Shadow Layer for depth */}
          <path
            d="M26 14H54C67 14 76 22 76 33C76 41 71 47 62 50C73 53 79 61 79 71C79 83 69 91 55 91H26C23 91 21 89 21 86V19C21 16 23 14 26 14Z"
            fill="rgba(15, 23, 42, 0.7)"
            transform="translate(2, 3)"
          />

          {/* Main 'B' Body */}
          <path
            d="M26 14H54C67 14 76 22 76 33C76 41 71 47 62 50C73 53 79 61 79 71C79 83 69 91 55 91H26C23 91 21 89 21 86V19C21 16 23 14 26 14Z"
            fill="url(#misterBGloss)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />

          {/* Top Loop Cutout */}
          <path
            d="M38 27H52C59 27 63 30 63 36C63 42 59 45 52 45H38V27Z"
            fill="#0f172a"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />

          {/* Bottom Loop Cutout */}
          <path
            d="M38 56H53C61 56 66 60 66 67C66 74 61 78 53 78H38V56Z"
            fill="#0f172a"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />

          {/* Top Metallic Highlight Streak */}
          <path
            d="M26 16H53C62 16 70 21 73 29C69 22 61 18 52 18H28C26 18 24 19 24 21V81C23 79 23 78 23 76V19C23 17 24 16 26 16Z"
            fill="url(#innerShine)"
          />
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
            Mister B
          </span>
        </div>
      )}
    </div>
  );
};

export default MisterBLogo;
