import React, { useState, useEffect } from 'react';
import { Phone, LogIn, RefreshCw, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { getUsers } from '../services/api';
import { formatDriveImageUrl } from '../utils/imageHelper';
import MisterBLogo from './MisterBLogo';

const normalizeNumber = (numStr) => {
  if (!numStr) return '';
  let digits = String(numStr).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

const LoginAuth = ({ onUnlock }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successUser, setSuccessUser] = useState(null);

  useEffect(() => {
    getUsers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUsersList(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanInput = normalizeNumber(phoneNumber);
    if (!cleanInput) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }

    setLoading(true);

    try {
      const freshUsers = await getUsers();
      const activeList = (Array.isArray(freshUsers) && freshUsers.length > 0) ? freshUsers : usersList;

      let matchedUser = null;

      if (activeList.length > 0) {
        const firstRowText = String(activeList[0][0] || '').toLowerCase();
        const hasHeader = firstRowText.includes('phone') || firstRowText.includes('mobile') || firstRowText.includes('number');
        const startIndex = hasHeader ? 1 : 0;

        for (let i = startIndex; i < activeList.length; i++) {
          const row = activeList[i];
          const sheetNum = normalizeNumber(row[0]);
          const name = row[1] || 'User';
          const role = row[2] || 'Staff';
          const status = row[3] ? String(row[3]).trim().toLowerCase() : 'active';
          const photo = formatDriveImageUrl(row[4] || '');

          if (sheetNum && (sheetNum === cleanInput || cleanInput.endsWith(sheetNum) || sheetNum.endsWith(cleanInput))) {
            if (status === 'inactive' || status === 'blocked') {
              setErrorMsg('Account is inactive.');
              setLoading(false);
              return;
            }
            matchedUser = {
              phone: row[0],
              name: name,
              role: role,
              photo: photo,
              rowNumber: i + 1
            };
            break;
          }
        }
      }

      // Emergency fallback if sheet not yet populated
      if (!matchedUser && activeList.length <= 1 && (cleanInput === '9876543210' || cleanInput === '1234567890')) {
        matchedUser = {
          phone: cleanInput,
          name: 'Admin',
          role: 'Admin',
          photo: '',
          rowNumber: 1
        };
      }

      if (matchedUser) {
        setSuccessUser(matchedUser);
        sessionStorage.setItem('misterb_auth', 'true');
        sessionStorage.setItem('misterb_user', JSON.stringify(matchedUser));

        setTimeout(() => {
          onUnlock(matchedUser);
        }, 700);
      } else {
        setErrorMsg('Invalid mobile number.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: '360px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Royal Letters Mister B Brand */}
        <div style={{ marginBottom: '24px' }}>
          <MisterBLogo size="large" showSubtitle={false} />
        </div>

        {/* Clean Login Card */}
        <div className="card" style={{
          width: '100%',
          padding: '28px 24px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)'
        }}>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <Phone size={15} color="var(--accent-primary)" />
                <span>Mobile Number</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter Mobile Number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
                required
                style={{
                  fontSize: '1.1rem',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: errorMsg ? '1px solid var(--danger)' : '1px solid var(--glass-border)'
                }}
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                textAlign: 'left',
                marginBottom: '18px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Feedback */}
            {successUser && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)',
                fontSize: '0.95rem',
                fontWeight: '600',
                marginBottom: '18px',
                justifyContent: 'center'
              }}>
                {successUser.photo ? (
                  <img
                    src={successUser.photo}
                    alt={successUser.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--success)',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                <span>Welcome, {successUser.name}!</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !!successUser}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginAuth;
