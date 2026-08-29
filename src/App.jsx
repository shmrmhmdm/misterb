import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, BookOpen, Receipt, Menu, X, Settings as SettingsIcon } from 'lucide-react';

import Sales from './pages/Sales';
import Settings from './pages/Settings';

import Dashboard from './pages/Dashboard';

import Ledger from './pages/Ledger';
import Expenses from './pages/Expenses';

const Sidebar = ({ isOpen, toggleSidebar }) => {
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
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
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
      
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      />
    </>
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
        
        <main className="main-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }} className="menu-toggle">
            <button className="btn" onClick={() => setSidebarOpen(true)} style={{ padding: '8px', background: 'var(--glass-bg)' }}>
              <Menu size={24} color="var(--text-primary)" />
            </button>
            <h2 style={{ margin: 0 }}>Mister B App</h2>
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
