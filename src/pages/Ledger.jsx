import React, { useState, useEffect, useMemo } from 'react';
import { getSales, getShops, getCollections, addCollection } from '../services/api';
import { 
  BookOpen, 
  Search, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  X, 
  DollarSign, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Ledger = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchShop, setSearchShop] = useState('');
  const [onlyDue, setOnlyDue] = useState(false);

  // Quick Collect Modal State
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [modalShop, setModalShop] = useState('');
  const [modalOutstanding, setModalOutstanding] = useState(0);
  const [modalAmount, setModalAmount] = useState('');
  const [modalPaymentMode, setModalPaymentMode] = useState('Cash');
  const [modalCollectedBy, setModalCollectedBy] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState('');

  useEffect(() => {
    calculateLedger();
  }, []);

  const calculateLedger = async () => {
    setLoading(true);
    const [salesData, shopsData, collectionsData] = await Promise.all([
      getSales(), 
      getShops(),
      getCollections()
    ]);
    
    let validSales = [];
    if (salesData && salesData.length > 0) {
      const firstCell = String(salesData[0][0]).toLowerCase();
      if (firstCell === 'date' || firstCell === 'തീയതി') validSales = salesData.slice(1);
      else validSales = salesData;
    }

    let validShops = [];
    if (shopsData && shopsData.length > 0) {
      const firstCell = String(shopsData[0][0]).toLowerCase();
      if (firstCell.includes('shop')) validShops = shopsData.slice(1);
      else validShops = shopsData;
    }

    let validCollections = [];
    if (collectionsData && collectionsData.length > 0) {
      const firstCell = String(collectionsData[0][0]).toLowerCase();
      if (firstCell === 'date' || firstCell === 'തീയതി') validCollections = collectionsData.slice(1);
      else validCollections = collectionsData;
    }

    // Map to hold calculated totals per shop
    const shopTotals = {};

    // Initialize with all master shops
    validShops.forEach(shopRow => {
      const shopName = (shopRow[0] || '').trim();
      if (shopName) {
        shopTotals[shopName] = { totalSale: 0, cashAtSale: 0, collectionsLater: 0 };
      }
    });

    // 1. Calculate from sales: [Date, Shop, Item, Qty, Price, Sale By, Cash Received]
    validSales.forEach(row => {
      const shopName = (row[1] || '').trim();
      const price = Number(row[4]) || 0;
      const cashReceived = Number(row[6]) || 0;
      
      if (shopName) {
        if (!shopTotals[shopName]) {
          shopTotals[shopName] = { totalSale: 0, cashAtSale: 0, collectionsLater: 0 };
        }
        shopTotals[shopName].totalSale += price;
        shopTotals[shopName].cashAtSale += cashReceived;
      }
    });

    // 2. Calculate from collections: [Date, Shop, Amount, Payment Mode, Collected By, Notes]
    validCollections.forEach(row => {
      const shopName = (row[1] || '').trim();
      const amount = Number(row[2]) || 0;

      if (shopName) {
        if (!shopTotals[shopName]) {
          shopTotals[shopName] = { totalSale: 0, cashAtSale: 0, collectionsLater: 0 };
        }
        shopTotals[shopName].collectionsLater += amount;
      }
    });

    // Format for display
    const calculatedLedger = Object.keys(shopTotals).map(shopName => {
      const totalSale = shopTotals[shopName].totalSale;
      const cashAtSale = shopTotals[shopName].cashAtSale;
      const collectionsLater = shopTotals[shopName].collectionsLater;
      const totalReceived = cashAtSale + collectionsLater;
      const outstanding = totalSale - totalReceived;
      return {
        shopName,
        totalSale,
        cashAtSale,
        collectionsLater,
        totalReceived,
        outstanding
      };
    });

    // Sort by largest outstanding balance first
    calculatedLedger.sort((a, b) => b.outstanding - a.outstanding);

    setLedger(calculatedLedger);
    setLoading(false);
  };

  // Overall Totals
  const overallTotals = useMemo(() => {
    let sales = 0;
    let atSale = 0;
    let collLater = 0;
    let received = 0;
    let due = 0;

    ledger.forEach(item => {
      sales += item.totalSale;
      atSale += item.cashAtSale;
      collLater += item.collectionsLater;
      received += item.totalReceived;
      due += item.outstanding;
    });

    return { sales, atSale, collLater, received, due };
  }, [ledger]);

  // Filtered ledger rows
  const filteredLedger = useMemo(() => {
    return ledger.filter(item => {
      const matchSearch = !searchShop || item.shopName.toLowerCase().includes(searchShop.toLowerCase());
      const matchDue = !onlyDue || item.outstanding > 0;
      return matchSearch && matchDue;
    });
  }, [ledger, searchShop, onlyDue]);

  // Quick Collect Handlers
  const handleOpenCollect = (shopItem) => {
    setModalShop(shopItem.shopName);
    setModalOutstanding(shopItem.outstanding);
    setModalAmount(shopItem.outstanding > 0 ? String(shopItem.outstanding) : '');
    setModalPaymentMode('Cash');
    setModalCollectedBy('');
    setModalNotes('');
    setModalFeedback('');
    setCollectModalOpen(true);
  };

  const handleCloseCollect = () => {
    setCollectModalOpen(false);
    setModalFeedback('');
  };

  const handleSaveQuickCollect = async (e) => {
    e.preventDefault();
    if (!modalAmount || Number(modalAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setModalSubmitting(true);
    setModalFeedback('');
    try {
      await addCollection({
        date: new Date().toISOString().split('T')[0],
        shop: modalShop,
        amount: Number(modalAmount),
        paymentMode: modalPaymentMode,
        collectedBy: modalCollectedBy,
        notes: modalNotes
      });
      setModalFeedback('✅ Collection saved successfully!');
      setTimeout(() => {
        handleCloseCollect();
        calculateLedger();
      }, 800);
    } catch (err) {
      setModalFeedback('❌ Failed to save collection.');
    }
    setModalSubmitting(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen color="var(--accent-color)" size={28} />
            Ledger (കണക്ക് പുസ്തകം)
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            ഷോപ്പുകളുടെ ആകെ വിൽപ്പന, കിട്ടിയ തുക, ബാക്കി കുടിശ്ശിക എന്നിവയുടെ ലെഡ്ജർ
          </p>
        </div>

        <Link to="/collections" className="btn btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={18} />
          <span>New Collection Entry</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-responsive" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', color: '#ef4444' }}>
            <AlertCircle size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Outstanding (ആകെ കുടിശ്ശിക)</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: '#ef4444' }}>
              ₹{overallTotals.due.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '12px', color: '#3b82f6' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Sales (ആകെ വിൽപ്പന)</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: '#3b82f6' }}>
              ₹{overallTotals.sales.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#10b981' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Received (ആകെ ലഭിച്ചത്)</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: '#10b981' }}>
              ₹{overallTotals.received.toLocaleString()}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              (Sale: ₹{overallTotals.atSale.toLocaleString()} + Due Coll: ₹{overallTotals.collLater.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Shop Ledger Balances</h3>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '180px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search shop..." 
                value={searchShop} 
                onChange={(e) => setSearchShop(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>

            <button 
              className="btn"
              onClick={() => setOnlyDue(!onlyDue)}
              style={{
                background: onlyDue ? 'rgba(239, 68, 68, 0.2)' : 'var(--glass-bg)',
                border: `1px solid ${onlyDue ? '#ef4444' : 'var(--glass-border)'}`,
                color: onlyDue ? '#ef4444' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Filter size={14} />
              <span>{onlyDue ? 'Showing Only Due' : 'Filter: Only Due'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Loading and calculating ledger data...
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Total Sale (₹)</th>
                  <th>At Sale (₹)</th>
                  <th>Due Collections (₹)</th>
                  <th>Total Received (₹)</th>
                  <th>Outstanding (₹)</th>
                  <th style={{ textAlign: 'center' }}>Quick Collect</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <Link 
                        to={`/reports?tab=shop&shop=${encodeURIComponent(row.shopName)}`} 
                        style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600' }}
                        title="View Shop Statement"
                      >
                        {row.shopName}
                      </Link>
                    </td>
                    <td>₹{row.totalSale.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>₹{row.cashAtSale.toLocaleString()}</td>
                    <td style={{ color: '#3b82f6', fontWeight: '500' }}>₹{row.collectionsLater.toLocaleString()}</td>
                    <td style={{ color: '#10b981', fontWeight: '600' }}>₹{row.totalReceived.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${row.outstanding > 0 ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.9rem' }}>
                        ₹{row.outstanding.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {row.outstanding > 0 ? (
                        <button 
                          className="btn" 
                          onClick={() => handleOpenCollect(row)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <PlusCircle size={14} />
                          <span>Collect</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredLedger.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No ledger data matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Collect Modal */}
      {collectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} color="var(--accent-color)" />
                Quick Due Collection
              </h3>
              <button className="btn" onClick={handleCloseCollect} style={{ padding: '4px', background: 'transparent' }}>
                <X size={20} />
              </button>
            </div>

            {modalFeedback && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.9rem' }}>
                {modalFeedback}
              </div>
            )}

            <form onSubmit={handleSaveQuickCollect}>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Shop Name:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{modalShop}</div>
                <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '2px' }}>
                  Current Outstanding: ₹{modalOutstanding.toLocaleString()}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Amount Received (₹):</label>
                <input 
                  type="number" 
                  value={modalAmount} 
                  onChange={(e) => setModalAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="any"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Payment Mode:</label>
                <select value={modalPaymentMode} onChange={(e) => setModalPaymentMode(e.target.value)}>
                  <option value="Cash">Cash (പണം)</option>
                  <option value="GPay / UPI">Google Pay / UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Collected By (Optional):</label>
                <input 
                  type="text" 
                  value={modalCollectedBy} 
                  onChange={(e) => setModalCollectedBy(e.target.value)}
                  placeholder="Collector name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Notes / Remarks (Optional):</label>
                <input 
                  type="text" 
                  value={modalNotes} 
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Notes"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={modalSubmitting} style={{ flex: 1 }}>
                  {modalSubmitting ? 'Saving...' : 'Save Collection'}
                </button>
                <button type="button" className="btn" onClick={handleCloseCollect} style={{ background: 'var(--glass-bg)' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;

