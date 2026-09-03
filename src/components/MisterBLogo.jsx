import React from 'react';

const MisterBLogo = ({ size = 96, showText = false, glow = true }) => {
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
        borderRadius: `${size * 0.28}px`,
        background: 'radial-gradient(circle at 50% 30%, rgba(14, 116, 144, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        boxShadow: glow 
          ? '0 12px 35px rgba(56, 189, 248, 0.4), 0 0 25px rgba(14, 165, 233, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Glowing Back-light Aura */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, transparent 70%)',
          filter: 'blur(10px)',
          pointerEvents: 'none'
        }} />

        {/* Dynamic Water & Fizz Bubbles */}
        <div style={{ position: 'absolute', width: '4px', height: '4px', borderRadius: '50%', background: '#a5f3fc', top: '15%', left: '18%', opacity: 0.85, boxShadow: '0 0 8px #38bdf8' }} />
        <div style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', top: '28%', right: '14%', opacity: 0.9, boxShadow: '0 0 8px #38bdf8' }} />
        <div style={{ position: 'absolute', width: '5px', height: '5px', borderRadius: '50%', background: '#67e8f9', bottom: '18%', left: '16%', opacity: 0.75, boxShadow: '0 0 6px #67e8f9' }} />
        <div style={{ position: 'absolute', width: '4px', height: '4px', borderRadius: '50%', background: '#e0f2fe', bottom: '26%', right: '18%', opacity: 0.85 }} />

        {/* Vector 3D Crown + 'B' + Splash SVG */}
        <svg
          viewBox="0 0 100 100"
          width={`${size * 0.78}px`}
          height={`${size * 0.78}px`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.6))' }}
        >
          <defs>
            <linearGradient id="bGradient" x1="25" y1="30" x2="75" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="75%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>

            <linearGradient id="crownGold" x1="30" y1="10" x2="70" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="80%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>

            <linearGradient id="splashGradient" x1="10" y1="40" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="metallicSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Dynamic Beverage Splash Wings Behind B */}
          <path
            d="M22 55C14 48 10 38 15 32C19 28 25 34 26 42M78 55C86 48 90 38 85 32C81 28 75 34 74 42"
            stroke="url(#splashGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M18 68C12 65 11 58 16 54C21 50 25 56 28 62M82 68C88 65 89 58 84 54C79 50 75 56 72 62"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Bottom Splash Wave Cradle */}
          <path
            d="M20 78C30 90 70 90 80 78C72 84 28 84 20 78Z"
            fill="url(#splashGradient)"
            opacity="0.7"
          />

          {/* Main 3D Letter 'B' */}
          {/* Outer B Shape */}
          <path
            d="M32 30H56C67 30 74 36 74 45C74 51 70 56 63 58C71 60 76 67 76 75C76 85 68 91 56 91H32C29.5 91 28 89.5 28 87V34C28 31.5 29.5 30 32 30Z"
            fill="url(#bGradient)"
            stroke="#e0f2fe"
            strokeWidth="1.8"
          />

          {/* Top Loop Cutout */}
          <path
            d="M42 41H54C59 41 62 43.5 62 48C62 52.5 59 55 54 55H42V41Z"
            fill="#0f172a"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.2"
          />

          {/* Bottom Loop Cutout */}
          <path
            d="M42 65H55C60.5 65 64 68 64 73.5C64 79 60.5 81.5 55 81.5H42V65Z"
            fill="#0f172a"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.2"
          />

          {/* Top Edge Highlight / Glass Sheen on 'B' */}
          <path
            d="M32 32H55C64 32 70 36 72 43C68 37 61 34 54 34H33C31 34 30 35 30 37V82C29 80 29 79 29 77V34C29 32.5 30.5 32 32 32Z"
            fill="url(#metallicSheen)"
          />

          {/* Luxury Crown on Top */}
          <path
            d="M33 30L37 13L46 22L50 11L54 22L63 13L67 30H33Z"
            fill="url(#crownGold)"
            stroke="#fef9c3"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Crown Jewels / Accents */}
          <circle cx="37" cy="13" r="1.8" fill="#ffffff" />
          <circle cx="50" cy="11" r="2.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="63" cy="13" r="1.8" fill="#ffffff" />
          
          {/* Crown Band Ribbon */}
          <path
            d="M34 27H66V30H34V27Z"
            fill="#ca8a04"
          />
          <circle cx="42" cy="28.5" r="1" fill="#38bdf8" />
          <circle cx="50" cy="28.5" r="1.2" fill="#ffffff" />
          <circle cx="58" cy="28.5" r="1" fill="#38bdf8" />

          {/* Sparkling Splash Droplets */}
          <circle cx="16" cy="26" r="1.8" fill="#e0f2fe" />
          <circle cx="84" cy="26" r="1.8" fill="#e0f2fe" />
          <circle cx="24" cy="20" r="1.2" fill="#bae6fd" />
          <circle cx="76" cy="20" r="1.2" fill="#bae6fd" />
        </svg>
      </div>

      {showText && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <span style={{
            fontSize: '1.45rem',
            fontWeight: '800',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ffffff 40%, #38bdf8 100%)',
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
