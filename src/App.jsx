import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, BookOpen, Receipt, Menu, X, Settings as SettingsIcon, Lock } from 'lucide-react';

import Sales from './pages/Sales';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Expenses from './pages/Expenses';
import PinLock from './components/PinLock';

const Sidebar = ({ isOpen, toggleSidebar, onLock }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/sales', name: 'Sales', icon: <ShoppingCart size={20} /> },
    { path: '/ledger', name: 'Ledger', icon: <BookOpen size={20} /> },
    { path: '/expenses', name: 'Expenses', icon: <Receipt size={20} /> },
    { path: '/settings', name: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ padding: '0 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mister B
            </h1>
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
            <span>Lock App (ലോക്ക്)</span>
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

  const handleUnlock = () => {
    sessionStorage.setItem('misterb_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    sessionStorage.removeItem('misterb_auth');
    setIsAuthenticated(false);
    setSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return <PinLock onUnlock={handleUnlock} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} onLock={handleLock} />
        
        <main className="main-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="menu-toggle">
                <button className="btn" onClick={() => setSidebarOpen(true)} style={{ padding: '8px', background: 'var(--glass-bg)' }}>
                  <Menu size={24} color="var(--text-primary)" />
                </button>
              </div>
              <h2 style={{ margin: 0 }}>Mister B App</h2>
            </div>

            <button 
              onClick={handleLock}
              className="btn" 
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 14px', fontSize: '0.85rem' }}
              title="Lock Application"
            >
              <Lock size={16} />
              <span>Lock</span>
            </button>
          </div>
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
