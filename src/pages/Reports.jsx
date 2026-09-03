import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getSales, getExpenses, getShops, getCollections } from '../services/api';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Store, 
  DollarSign, 
  TrendingDown, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'summary';
  const initialShopParam = searchParams.get('shop') || '';

  const [activeTab, setActiveTab] = useState(initialTab); // 'summary' | 'shop' | 'expense' | 'collections'
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [shops, setShops] = useState([]);
  const [collections, setCollections] = useState([]);

  // Date Filters
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(todayStr);

  // Shop filter
  const [selectedShop, setSelectedShop] = useState(initialShopParam);

  // Expense Category filter
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [salesData, expensesData, shopsData, collectionsData] = await Promise.all([
      getSales(), getExpenses(), getShops(), getCollections()
    ]);

    // Parse sales
    let validSales = [];
    if (salesData && salesData.length > 0) {
      const firstCell = String(salesData[0][0]).toLowerCase();
      validSales = (firstCell === 'date') ? salesData.slice(1) : salesData;
    }
    setSales(validSales);

    // Parse expenses
    let validExpenses = [];
    if (expensesData && expensesData.length > 0) {
      const firstCell = String(expensesData[0][0]).toLowerCase();
      validExpenses = (firstCell === 'date') ? expensesData.slice(1) : expensesData;
    }
    setExpenses(validExpenses);

    // Parse collections
    let validCollections = [];
    if (collectionsData && collectionsData.length > 0) {
      const firstCell = String(collectionsData[0][0]).toLowerCase();
      validCollections = (firstCell === 'date') ? collectionsData.slice(1) : collectionsData;
    }
    setCollections(validCollections);

    // Parse shops
    let validShops = [];
    if (shopsData && shopsData.length > 0) {
      const firstCell = String(shopsData[0][0]).toLowerCase();
      validShops = firstCell.includes('shop') ? shopsData.slice(1) : shopsData;
    }
    setShops(validShops);
    if (validShops.length > 0 && !selectedShop) {
      setSelectedShop(initialShopParam || validShops[0][0]);
    }

    setLoading(false);
  };

  // Quick Date Preset Handlers
  const handleDatePreset = (preset) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'thisWeek') {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(today);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(today);
    } else if (preset === 'lastMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'thisYear') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(today);
    } else if (preset === 'all') {
      setStartDate('2020-01-01');
      setEndDate(today);
    }
  };

  // Helper date checker
  const isWithinDateRange = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr).toISOString().split('T')[0];
    return (!startDate || d >= startDate) && (!endDate || d <= endDate);
  };

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter(row => isWithinDateRange(row[0]));
  }, [sales, startDate, endDate]);

  // Filtered Collections
  const filteredCollections = useMemo(() => {
    return collections.filter(row => isWithinDateRange(row[0]));
  }, [collections, startDate, endDate]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(row => {
      const matchDate = isWithinDateRange(row[0]);
      const matchCat = selectedCategory === 'all' || (row[1] || '').toLowerCase() === selectedCategory.toLowerCase();
      return matchDate && matchCat;
    });
  }, [expenses, startDate, endDate, selectedCategory]);

  // Shop-specific Statement Data (Combined Sales & Due Collections)
  const shopStatementData = useMemo(() => {
    if (!selectedShop) return { rows: [], totalSales: 0, totalReceived: 0, rangeSales: 0, rangePaid: 0, currentOutstanding: 0 };

    const cleanShop = selectedShop.trim().toLowerCase();

    // 1. All-time Sales and Collections for this shop
    const shopSalesAll = sales.filter(row => (row[1] || '').trim().toLowerCase() === cleanShop);
    const shopCollAll = collections.filter(row => (row[1] || '').trim().toLowerCase() === cleanShop);

    let allTimeSales = 0;
    let allTimeReceived = 0;

    shopSalesAll.forEach(row => {
      allTimeSales += Number(row[4]) || 0;
      allTimeReceived += Number(row[6]) || 0;
    });

    shopCollAll.forEach(row => {
      allTimeReceived += Number(row[2]) || 0;
    });

    const currentOutstanding = allTimeSales - allTimeReceived;

    // 2. Build chronological unified ledger for the shop
    const combinedTransactions = [];

    shopSalesAll.forEach(row => {
      if (isWithinDateRange(row[0])) {
        combinedTransactions.push({
          date: row[0],
          type: 'Sale',
          item: row[2] || 'Item Sale',
          qty: row[3] || '',
          debit: Number(row[4]) || 0,       // Sale amount (+)
          credit: Number(row[6]) || 0,      // Paid at sale (-)
          paymentMode: 'At Sale',
          by: row[5] || '',
          notes: ''
        });
      }
    });

    shopCollAll.forEach(row => {
      if (isWithinDateRange(row[0])) {
        combinedTransactions.push({
          date: row[0],
          type: 'Due Collection',
          item: 'Due Collection / Payment',
          qty: '',
          debit: 0,
          credit: Number(row[2]) || 0,      // Collection amount (-)
          paymentMode: row[3] || 'Cash',
          by: row[4] || '',
          notes: row[5] || ''
        });
      }
    });

    // Sort chronologically by date
    combinedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let rangeSales = 0;
    let rangePaid = 0;

    combinedTransactions.forEach(item => {
      rangeSales += item.debit;
      rangePaid += item.credit;
    });

    return {
      rows: combinedTransactions,
      rangeSales,
      rangePaid,
      currentOutstanding
    };
  }, [sales, collections, selectedShop, startDate, endDate]);

  // Overall Financial Totals for Filtered Range
  const summaryTotals = useMemo(() => {
    let totalSales = 0;
    let cashAtSale = 0;
    let dueCollections = 0;
    let totalExpenses = 0;

    filteredSales.forEach(row => {
      totalSales += Number(row[4]) || 0;
      cashAtSale += Number(row[6]) || 0;
    });

    filteredCollections.forEach(row => {
      dueCollections += Number(row[2]) || 0;
    });

    filteredExpenses.forEach(row => {
      totalExpenses += Number(row[3]) || 0;
    });

    const totalReceived = cashAtSale + dueCollections;
    const netCash = totalReceived - totalExpenses;
    const creditGiven = totalSales - totalReceived;

    return { totalSales, cashAtSale, dueCollections, totalReceived, totalExpenses, netCash, creditGiven };
  }, [filteredSales, filteredCollections, filteredExpenses]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV Handler
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    let filename = `misterb_report_${startDate}_to_${endDate}.csv`;

    if (activeTab === 'summary') {
      csvContent += `Mister B - Financial Report (${startDate} to ${endDate})\n\n`;
      csvContent += `Total Sales,₹${summaryTotals.totalSales}\n`;
      csvContent += `Cash Received At Sale,₹${summaryTotals.cashAtSale}\n`;
      csvContent += `Due Collections Received,₹${summaryTotals.dueCollections}\n`;
      csvContent += `Total Cash Inflow,₹${summaryTotals.totalReceived}\n`;
      csvContent += `Total Expenses,₹${summaryTotals.totalExpenses}\n`;
      csvContent += `Net Cash Flow,₹${summaryTotals.netCash}\n\n`;
      
      csvContent += `SALES TRANSACTIONS\n`;
      csvContent += `Date,Shop,Item,Quantity,Price,Cash Received,Sale By\n`;
      filteredSales.forEach(row => {
        csvContent += `"${row[0] || ''}","${row[1] || ''}","${row[2] || ''}","${row[3] || ''}","${row[4] || 0}","${row[6] || 0}","${row[5] || ''}"\n`;
      });

      csvContent += `\nDUE COLLECTIONS\n`;
      csvContent += `Date,Shop,Amount Received,Payment Mode,Collected By,Notes\n`;
      filteredCollections.forEach(row => {
        csvContent += `"${row[0] || ''}","${row[1] || ''}","${row[2] || 0}","${row[3] || ''}","${row[4] || ''}","${row[5] || ''}"\n`;
      });

      csvContent += `\nEXPENSE TRANSACTIONS\n`;
      csvContent += `Date,Category,Description,Amount,Payment Method\n`;
      filteredExpenses.forEach(row => {
        csvContent += `"${row[0] || ''}","${row[1] || ''}","${row[2] || ''}","${row[3] || 0}","${row[4] || ''}"\n`;
      });
    } else if (activeTab === 'shop') {
      filename = `misterb_shop_statement_${selectedShop}_${startDate}_to_${endDate}.csv`;
      csvContent += `Mister B - Shop Statement: ${selectedShop}\n`;
      csvContent += `Period: ${startDate} to ${endDate}\n`;
      csvContent += `Current Total Outstanding: ₹${shopStatementData.currentOutstanding}\n\n`;
      csvContent += `Date,Transaction Type,Particulars,Debit/Sale (₹),Credit/Paid (₹),Payment Mode,By,Notes\n`;
      
      shopStatementData.rows.forEach(row => {
        csvContent += `"${row.date || ''}","${row.type}","${row.item}","${row.debit}","${row.credit}","${row.paymentMode}","${row.by}","${row.notes}"\n`;
      });
    } else if (activeTab === 'collections') {
      filename = `misterb_collections_report_${startDate}_to_${endDate}.csv`;
      csvContent += `Mister B - Due Collections Report (${startDate} to ${endDate})\n`;
      csvContent += `Total Amount Collected: ₹${summaryTotals.dueCollections}\n\n`;
      csvContent += `Date,Shop,Amount (₹),Payment Mode,Collected By,Notes\n`;
      filteredCollections.forEach(row => {
        csvContent += `"${row[0] || ''}","${row[1] || ''}","${row[2] || 0}","${row[3] || ''}","${row[4] || ''}","${row[5] || ''}"\n`;
      });
    } else {
      filename = `misterb_expenses_report_${startDate}_to_${endDate}.csv`;
      csvContent += `Mister B - Expense Report (${startDate} to ${endDate})\n`;
      csvContent += `Category: ${selectedCategory.toUpperCase()}\n`;
      csvContent += `Total Amount: ₹${summaryTotals.totalExpenses}\n\n`;
      csvContent += `Date,Expense Type,Description,Amount (₹),Payment Method\n`;
      filteredExpenses.forEach(row => {
        csvContent += `"${row[0] || ''}","${row[1] || ''}","${row[2] || ''}","${row[3] || 0}","${row[4] || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Reports & Statements</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            View and download sales, expenses, and shop ledger statements
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrint} 
            className="btn" 
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
          >
            <Printer size={16} /> Print / PDF
          </button>

          <button 
            onClick={handleExportCSV} 
            className="btn btn-primary"
          >
            <Download size={16} /> Download Excel (CSV)
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Custom Date Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>From:</label>
              <input 
                type="date" 
                className="form-input" 
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.9rem' }}
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>To:</label>
              <input 
                type="date" 
                className="form-input" 
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.9rem' }}
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => handleDatePreset('today')} className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>Today</button>
            <button onClick={() => handleDatePreset('thisWeek')} className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>This Week</button>
            <button onClick={() => handleDatePreset('thisMonth')} className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>This Month</button>
            <button onClick={() => handleDatePreset('lastMonth')} className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>Last Month</button>
            <button onClick={() => handleDatePreset('thisYear')} className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>This Year</button>
            <button onClick={() => handleDatePreset('all')} className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>All Time</button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('summary')}
          className="btn"
          style={{
            background: activeTab === 'summary' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'summary' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: activeTab === 'summary' ? '600' : '500'
          }}
        >
          <FileText size={16} /> General Summary
        </button>

        <button 
          onClick={() => setActiveTab('shop')}
          className="btn"
          style={{
            background: activeTab === 'shop' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'shop' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: activeTab === 'shop' ? '600' : '500'
          }}
        >
          <Store size={16} /> Shop Statement
        </button>

        <button 
          onClick={() => setActiveTab('collections')}
          className="btn"
          style={{
            background: activeTab === 'collections' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'collections' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: activeTab === 'collections' ? '600' : '500'
          }}
        >
          <Wallet size={16} /> Collections Report
        </button>

        <button 
          onClick={() => setActiveTab('expense')}
          className="btn"
          style={{
            background: activeTab === 'expense' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'expense' ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: activeTab === 'expense' ? '600' : '500'
          }}
        >
          <TrendingDown size={16} /> Expense Report
        </button>
      </div>

      {loading ? <p>Loading report data...</p> : (
        <>
          {/* TAB 1: GENERAL SUMMARY */}
          {activeTab === 'summary' && (
            <div>
              {/* Financial KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Sales</span>
                  <p style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '6px 0 0 0', color: '#3b82f6' }}>
                    ₹{summaryTotals.totalSales.toLocaleString()}
                  </p>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Cash Inflow</span>
                  <p style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '6px 0 0 0', color: '#10b981' }}>
                    ₹{summaryTotals.totalReceived.toLocaleString()}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Sale: ₹{summaryTotals.cashAtSale.toLocaleString()} | Due Coll: ₹{summaryTotals.dueCollections.toLocaleString()}
                  </span>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Expenses</span>
                  <p style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '6px 0 0 0', color: '#ef4444' }}>
                    ₹{summaryTotals.totalExpenses.toLocaleString()}
                  </p>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Net Cash Flow</span>
                  <p style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '6px 0 0 0', color: summaryTotals.netCash >= 0 ? '#10b981' : '#ef4444' }}>
                    ₹{summaryTotals.netCash.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Sales Table in Range */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <h3>Sales Transactions ({filteredSales.length})</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Shop Name</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price (₹)</th>
                        <th>Cash Rec (₹)</th>
                        <th>Credit (₹)</th>
                        <th>Sale By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((row, idx) => {
                        const price = Number(row[4]) || 0;
                        const rec = Number(row[6]) || 0;
                        return (
                          <tr key={idx}>
                            <td>{row[0] ? new Date(row[0]).toLocaleDateString() : 'N/A'}</td>
                            <td style={{ fontWeight: '600' }}>{row[1]}</td>
                            <td>{row[2]}</td>
                            <td>{row[3]}</td>
                            <td><span className="badge badge-success">₹{price.toLocaleString()}</span></td>
                            <td>₹{rec.toLocaleString()}</td>
                            <td style={{ color: price - rec > 0 ? 'var(--warning)' : 'inherit' }}>
                              ₹{(price - rec).toLocaleString()}
                            </td>
                            <td>{row[5]}</td>
                          </tr>
                        );
                      })}
                      {filteredSales.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center' }}>No sales recorded for this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Due Collections in Range */}
              <div className="card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={18} color="#10b981" />
                  Due Collections Received in Range ({filteredCollections.length})
                </h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Shop Name</th>
                        <th>Amount Received (₹)</th>
                        <th>Payment Mode</th>
                        <th>Collected By</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollections.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[0] ? new Date(row[0]).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ fontWeight: '600' }}>{row[1]}</td>
                          <td><span className="badge badge-success" style={{ fontSize: '0.9rem' }}>₹{Number(row[2] || 0).toLocaleString()}</span></td>
                          <td><span className="badge badge-primary">{row[3] || 'Cash'}</span></td>
                          <td>{row[4] || '-'}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{row[5] || '-'}</td>
                        </tr>
                      ))}
                      {filteredCollections.length === 0 && (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No due collections recorded for this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHOP-WISE STATEMENT */}
          {activeTab === 'shop' && (
            <div>
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Select Shop:</label>
                  <select 
                    className="form-input" 
                    style={{ width: 'auto', minWidth: '250px' }}
                    value={selectedShop} 
                    onChange={(e) => setSelectedShop(e.target.value)}
                  >
                    {shops.map((s, i) => (
                      <option key={i} value={s[0]}>{s[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shop Metric Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sales in Selected Period</span>
                  <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                    ₹{shopStatementData.rangeSales.toLocaleString()}
                  </p>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Paid in Selected Period</span>
                  <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                    ₹{shopStatementData.rangePaid.toLocaleString()}
                  </p>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Current All-Time Outstanding</span>
                  <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '4px 0 0 0', color: shopStatementData.currentOutstanding > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    ₹{shopStatementData.currentOutstanding.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Shop Ledger Transactions Table */}
              <div className="card">
                <h3>Unified Statement for {selectedShop} ({shopStatementData.rows.length} Entries)</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Particulars / Notes</th>
                        <th>Qty</th>
                        <th>Sale/Debit (₹)</th>
                        <th>Paid/Credit (₹)</th>
                        <th>Payment Mode</th>
                        <th>Handled By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shopStatementData.rows.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <span className={`badge ${row.type === 'Sale' ? 'badge-primary' : 'badge-success'}`}>
                              {row.type}
                            </span>
                          </td>
                          <td>
                            <strong>{row.item}</strong>
                            {row.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Note: {row.notes}</div>}
                          </td>
                          <td>{row.qty || '-'}</td>
                          <td>
                            {row.debit > 0 ? (
                              <span style={{ fontWeight: '600', color: '#ef4444' }}>+₹{row.debit.toLocaleString()}</span>
                            ) : '-'}
                          </td>
                          <td>
                            {row.credit > 0 ? (
                              <span style={{ fontWeight: '600', color: '#10b981' }}>-₹{row.credit.toLocaleString()}</span>
                            ) : '-'}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.paymentMode}</span>
                          </td>
                          <td>{row.by || '-'}</td>
                        </tr>
                      ))}
                      {shopStatementData.rows.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center' }}>No transactions found for {selectedShop} in this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DUE COLLECTIONS REPORT */}
          {activeTab === 'collections' && (
            <div>
              {/* Total Collections Card */}
              <div className="card" style={{ borderLeft: '4px solid #10b981', marginBottom: '24px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Due Collections in Period</span>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0 0 0', color: '#10b981' }}>
                  ₹{summaryTotals.dueCollections.toLocaleString()}
                </p>
              </div>

              {/* Collections Table */}
              <div className="card">
                <h3>Due Collection Records ({filteredCollections.length})</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Shop Name</th>
                        <th>Amount (₹)</th>
                        <th>Payment Mode</th>
                        <th>Collected By</th>
                        <th>Notes / Invoice Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollections.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[0] ? new Date(row[0]).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ fontWeight: '600' }}>{row[1]}</td>
                          <td><span className="badge badge-success">₹{Number(row[2] || 0).toLocaleString()}</span></td>
                          <td><span className="badge badge-primary">{row[3] || 'Cash'}</span></td>
                          <td>{row[4] || '-'}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{row[5] || '-'}</td>
                        </tr>
                      ))}
                      {filteredCollections.length === 0 && (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No due collections recorded for this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPENSE STATEMENT */}
          {activeTab === 'expense' && (
            <div>
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Filter Category:</label>
                  <select 
                    className="form-input" 
                    style={{ width: 'auto', minWidth: '200px' }}
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">-- All Categories --</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Food">Food</option>
                    <option value="Salary">Salary</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Total Expenses Card */}
              <div className="card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '24px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Filtered Expenses</span>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0 0 0', color: '#ef4444' }}>
                  ₹{summaryTotals.totalExpenses.toLocaleString()}
                </p>
              </div>

              {/* Expense Table */}
              <div className="card">
                <h3>Expense Records ({filteredExpenses.length})</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount (₹)</th>
                        <th>Payment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[0] ? new Date(row[0]).toLocaleDateString() : 'N/A'}</td>
                          <td><span className="badge badge-warning">{row[1]}</span></td>
                          <td>{row[2]}</td>
                          <td><span className="badge badge-danger">₹{Number(row[3]).toLocaleString()}</span></td>
                          <td>{row[4]}</td>
                        </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No expenses found for this selection.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
