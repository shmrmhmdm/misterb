import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, BookOpen, Receipt, Menu, X, Settings as SettingsIcon, Lock, FileText, Wallet } from 'lucide-react';

import Sales from './pages/Sales';
import Collections from './pages/Collections';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import LoginAuth from './components/LoginAuth';

const Sidebar = ({ isOpen, toggleSidebar, onLock, currentUser }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/sales', name: 'Sales', icon: <ShoppingCart size={20} /> },
    { path: '/collections', name: 'Collections', icon: <Wallet size={20} /> },
    { path: '/ledger', name: 'Ledger', icon: <BookOpen size={20} /> },
    { path: '/expenses', name: 'Expenses', icon: <Receipt size={20} /> },
    { path: '/reports', name: 'Reports', icon: <FileText size={20} /> },
    { path: '/settings', name: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ padding: '0 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Mister B
              </h1>
              {currentUser?.name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  {currentUser.photo ? (
                    <img
                      src={currentUser.photo}
                      alt={currentUser.name}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-primary)' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : null}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {currentUser.name} ({currentUser.role || 'Staff'})
                  </span>
                </div>
              )}
            </div>
            <button className="menu-toggle btn" onClick={toggleSidebar} style={{ padding: '4px', background: 'transparent' }}>
              <X size={24} color="var(--text-primary)" />
            </button>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => toggleSidebar()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    borderRadius: '8px', textDecoration: 'none',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-gradient)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lock App / Logout Button */}
        <div style={{ padding: '16px' }}>
          <button 
            onClick={onLock}
            className="btn"
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              justifyContent: 'flex-start',
              padding: '12px 16px'
            }}
          >
            <Lock size={18} />
            <span>Logout / പുറത്തുകടക്കുക</span>
          </button>
        </div>
      </div>
      
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      />
    </>
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('misterb_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('misterb_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleUnlock = (userData) => {
    sessionStorage.setItem('misterb_auth', 'true');
    if (userData) {
      setCurrentUser(userData);
      sessionStorage.setItem('misterb_user', JSON.stringify(userData));
    }
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    sessionStorage.removeItem('misterb_auth');
    sessionStorage.removeItem('misterb_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return <LoginAuth onUnlock={handleUnlock} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} onLock={handleLock} currentUser={currentUser} />
        
        <main className="main-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="menu-toggle">
                <button className="btn" onClick={() => setSidebarOpen(true)} style={{ padding: '8px', background: 'var(--glass-bg)' }}>
                  <Menu size={24} color="var(--text-primary)" />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {currentUser?.photo && (
                  <img
                    src={currentUser.photo}
                    alt={currentUser.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)', boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Mister B App</h2>
                  {currentUser?.name && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                      👋 {currentUser.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={handleLock}
              className="btn" 
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 14px', fontSize: '0.85rem' }}
              title="Logout / Lock Application"
            >
              <Lock size={16} />
              <span>Logout</span>
            </button>
          </div>
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
