import React from 'react';

const MisterBLogo = ({ size = 'normal', showSubtitle = false }) => {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      textAlign: 'center',
      padding: '12px 0',
      position: 'relative'
    }}>
      {/* Background Neon Aura Bloom */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '180px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(56, 189, 248, 0.35) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 80%)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Cursive Neon "MisterB" Heading */}
      <h1 style={{
        margin: 0,
        position: 'relative',
        zIndex: 1,
        fontFamily: "'Great Vibes', 'Dancing Script', cursive",
        fontSize: size === 'large' ? '4rem' : '3.4rem',
        fontWeight: '400',
        letterSpacing: '1px',
        color: '#ffffff',
        textShadow: `
          0 0 5px #ffffff,
          0 0 10px #38bdf8,
          0 0 20px #38bdf8,
          0 0 40px #0284c7,
          0 0 80px #0284c7,
          0 0 100px #0369a1
        `,
        lineHeight: '1.1',
        padding: '0 10px',
        transform: 'rotate(-2deg)'
      }}>
        MisterB
      </h1>

      {/* Subtle Neon Underline Accent */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        marginTop: '-4px',
        width: '140px',
        height: '2px',
        borderRadius: '2px',
        background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)',
        boxShadow: '0 0 10px #38bdf8, 0 0 20px #38bdf8'
      }} />

      {showSubtitle && (
        <span style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          fontWeight: '600',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#bae6fd',
          textShadow: '0 0 8px rgba(56, 189, 248, 0.8)',
          marginTop: '8px'
        }}>
          Soda & Beverages
        </span>
      )}
    </div>
  );
};

export default MisterBLogo;
