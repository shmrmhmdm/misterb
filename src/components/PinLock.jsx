import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';

const PinLock = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  const getSavedPin = () => {
    return localStorage.getItem('misterb_pin') || '1234';
  };

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = (enteredPin) => {
    const savedPin = getSavedPin();
    if (enteredPin === savedPin) {
      setErrorMessage('');
      setError(false);
      setTimeout(() => {
        onUnlock();
      }, 200);
    } else {
      setError(true);
      setErrorMessage('Incorrect PIN! Please try again.');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 600);
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.15), transparent 70%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '380px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* App Logo / Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
          marginBottom: '20px'
        }}>
          <Lock size={36} color="#ffffff" />
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '6px',
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Mister B
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Enter 4-Digit PIN
        </p>

        {/* 4 Pin Indicator Dots */}
        <div style={{
          display: 'flex',
          gap: '18px',
          marginBottom: '24px',
          transform: shake ? 'translateX(-8px)' : 'none',
          transition: 'transform 0.1s ease',
          animation: shake ? 'pinShake 0.4s ease' : 'none'
        }}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${error ? 'var(--danger)' : isFilled ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.2)'}`,
                  background: error ? 'var(--danger)' : isFilled ? 'var(--accent-gradient)' : 'transparent',
                  boxShadow: isFilled ? '0 0 12px rgba(59, 130, 246, 0.6)' : 'none',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isFilled ? 'scale(1.15)' : 'scale(1)'
                }}
              />
            );
          })}
        </div>

        {/* Error message */}
        <div style={{ minHeight: '24px', marginBottom: '16px' }}>
          {errorMessage && (
            <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600' }}>
              {errorMessage}
            </span>
          )}
        </div>

        {/* Dialpad Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
          maxWidth: '300px',
          marginBottom: '24px'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(String(num))}
              style={{
                height: '64px',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                userSelect: 'none'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Delete */}
          <button
            onClick={handleClear}
            style={{
              height: '64px',
              borderRadius: '16px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Clear
          </button>

          <button
            onClick={() => handleDigit('0')}
            style={{
              height: '64px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              userSelect: 'none'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            0
          </button>

          <button
            onClick={handleDelete}
            style={{
              height: '64px',
              borderRadius: '16px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete"
          >
            <Delete size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinLock;
