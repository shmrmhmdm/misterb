import React, { useState, useEffect, useMemo } from 'react';
import { getSales, getExpenses, getLedger } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        minWidth: '150px'
      }}>
        {label && <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: '#f8fafc' }}>{label}</p>}
        {payload.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', margin: '4px 0', color: item.color || item.fill }}>
            <span>{item.name}:</span>
            <span style={{ fontWeight: '700' }}>₹{Number(item.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalReceived: 0,
    totalOutstanding: 0,
    totalExpenses: 0,
    netCash: 0
  });
  
  const [shopDetails, setShopDetails] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Raw data from Google Sheets
  const [rawData, setRawData] = useState({ sales: [], expenses: [], ledger: [] });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && rawData.sales.length >= 0) {
      calculateSummary(rawData.sales, rawData.expenses, rawData.ledger, selectedMonth);
    }
  }, [selectedMonth, rawData]);

  const fetchData = async () => {
    setLoading(true);
    const [salesData, expensesData, ledgerData] = await Promise.all([
      getSales(), getExpenses(), getLedger()
    ]);
    
    setRawData({ sales: salesData, expenses: expensesData, ledger: ledgerData });
    setLoading(false);
  };

  // Helper to parse date string
  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const calculateSummary = (salesData, expensesData, ledgerData, monthStr) => {
    let totalSales = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;
    let totalExpenses = 0;

    const isSameMonth = (dateString) => {
      const d = parseDateStr(dateString);
      if (!d) return false;
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return m === monthStr;
    };

    let validSales = [];
    if (salesData && salesData.length > 0) {
      const firstCell = String(salesData[0][0]).toLowerCase();
      if (firstCell === 'date' || firstCell === 'തീയതി') validSales = salesData.slice(1);
      else validSales = salesData;
    }

    let validExpenses = [];
    if (expensesData && expensesData.length > 0) {
      const firstCell = String(expensesData[0][0]).toLowerCase();
      if (firstCell === 'date' || firstCell === 'തീയതി') validExpenses = expensesData.slice(1);
      else validExpenses = expensesData;
    }

    if (validSales.length > 0) {
      validSales.forEach(row => {
        if (isSameMonth(row[0])) {
          totalSales += Number(row[4]) || 0;
          totalReceived += Number(row[6]) || 0;
        }
      });
    }

    // Outstanding calculated across all time
    const shopOutstandings = {};
    if (validSales.length > 0) {
       let allSales = 0;
       let allReceived = 0;
       validSales.forEach(row => {
          const date = row[0];
          const shop = row[1];
          const price = Number(row[4]) || 0;
          const cashRec = Number(row[6]) || 0;
          
          allSales += price;
          allReceived += cashRec;
          
          if (shop) {
             if (!shopOutstandings[shop]) {
                shopOutstandings[shop] = { outstanding: 0, lastDate: date };
             }
             shopOutstandings[shop].outstanding += (price - cashRec);
             if (date) shopOutstandings[shop].lastDate = date; 
          }
       });
       totalOutstanding = allSales - allReceived;
    }
    
    const formattedShopDetails = Object.keys(shopOutstandings)
      .map(shop => ({
         name: shop,
         outstanding: shopOutstandings[shop].outstanding,
         lastDate: shopOutstandings[shop].lastDate
      }))
      .filter(s => s.outstanding !== 0); 

    const expenseCategories = {};
    if (validExpenses.length > 0) {
      validExpenses.forEach(row => {
        if (isSameMonth(row[0])) {
          const amount = Number(row[3]) || 0;
          const category = row[1] || 'Other';
          totalExpenses += amount;
          
          if (!expenseCategories[category]) {
            expenseCategories[category] = 0;
          }
          expenseCategories[category] += amount;
        }
      });
    }

    const formattedExpenseDetails = Object.keys(expenseCategories)
      .map(cat => ({
         category: cat,
         amount: expenseCategories[cat]
      }))
      .filter(c => c.amount > 0);

    const netCash = totalReceived - totalExpenses;
    setSummary({ totalSales, totalReceived, totalOutstanding, totalExpenses, netCash });
    setShopDetails(formattedShopDetails);
    setExpenseDetails(formattedExpenseDetails);
  };

  // --- CHART 1: Daily Trend in Selected Month ---
  const dailyChartData = useMemo(() => {
    let validSales = rawData.sales?.length ? (String(rawData.sales[0][0]).toLowerCase().includes('date') ? rawData.sales.slice(1) : rawData.sales) : [];
    let validExpenses = rawData.expenses?.length ? (String(rawData.expenses[0][0]).toLowerCase().includes('date') ? rawData.expenses.slice(1) : rawData.expenses) : [];

    const dailyMap = {};

    validSales.forEach(row => {
      const d = parseDateStr(row[0]);
      if (!d) return;
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (mStr === selectedMonth) {
        const dayKey = `${String(d.getDate()).padStart(2, '0')}`;
        if (!dailyMap[dayKey]) dailyMap[dayKey] = { day: dayKey, sales: 0, received: 0, expenses: 0 };
        dailyMap[dayKey].sales += Number(row[4]) || 0;
        dailyMap[dayKey].received += Number(row[6]) || 0;
      }
    });

    validExpenses.forEach(row => {
      const d = parseDateStr(row[0]);
      if (!d) return;
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (mStr === selectedMonth) {
        const dayKey = `${String(d.getDate()).padStart(2, '0')}`;
        if (!dailyMap[dayKey]) dailyMap[dayKey] = { day: dayKey, sales: 0, received: 0, expenses: 0 };
        dailyMap[dayKey].expenses += Number(row[3]) || 0;
      }
    });

    return Object.keys(dailyMap)
      .sort((a, b) => Number(a) - Number(b))
      .map(k => dailyMap[k]);
  }, [rawData, selectedMonth]);

  // --- CHART 2: Category Expenses Breakdown ---
  const categoryChartData = useMemo(() => {
    return expenseDetails.map(item => ({
      name: item.category,
      value: item.amount
    }));
  }, [expenseDetails]);

  // --- CHART 3: Multi-Month Performance Trend ---
  const multiMonthData = useMemo(() => {
    let validSales = rawData.sales?.length ? (String(rawData.sales[0][0]).toLowerCase().includes('date') ? rawData.sales.slice(1) : rawData.sales) : [];
    let validExpenses = rawData.expenses?.length ? (String(rawData.expenses[0][0]).toLowerCase().includes('date') ? rawData.expenses.slice(1) : rawData.expenses) : [];

    const monthMap = {};

    validSales.forEach(row => {
      const d = parseDateStr(row[0]);
      if (!d) return;
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthMap[mKey]) monthMap[mKey] = { month: mLabel, key: mKey, sales: 0, expenses: 0, received: 0 };
      monthMap[mKey].sales += Number(row[4]) || 0;
      monthMap[mKey].received += Number(row[6]) || 0;
    });

    validExpenses.forEach(row => {
      const d = parseDateStr(row[0]);
      if (!d) return;
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthMap[mKey]) monthMap[mKey] = { month: mLabel, key: mKey, sales: 0, expenses: 0, received: 0 };
      monthMap[mKey].expenses += Number(row[3]) || 0;
    });

    return Object.keys(monthMap)
      .sort()
      .slice(-6) // Last 6 recorded months
      .map(k => ({
        ...monthMap[k],
        netProfit: monthMap[k].received - monthMap[k].expenses
      }));
  }, [rawData]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Monthly Summary</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Select Month: </label>
          <input 
            type="month" 
            className="form-input" 
            style={{ width: 'auto', padding: '8px 12px' }}
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
          />
        </div>
      </div>
      
      {loading ? <p>Loading summary & charts...</p> : (
        <>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Sales (This Month)</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalSales.toLocaleString()}</p>
            </div>
            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Received (This Month)</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalReceived.toLocaleString()}</p>
            </div>
            <div 
              className="card" 
              style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => setShowExpenseModal(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Click to view category-wise expenses"
            >
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Expenses (This Month) <small style={{fontSize:'0.7rem'}}>(Click details)</small></h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalExpenses.toLocaleString()}</p>
            </div>
            <div 
              className="card" 
              style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => setShowModal(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Click to view shop-wise details"
            >
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Total Outstanding <small style={{fontSize:'0.7rem'}}>(Click details)</small></h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalOutstanding.toLocaleString()}</p>
            </div>
            
            <div className="card" style={{ background: 'rgba(99, 102, 241, 0.1)', borderLeft: '4px solid #6366f1', gridColumn: '1 / -1' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Net Cash (This Month)</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: summary.netCash >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ₹{summary.netCash.toLocaleString()}
              </p>
            </div>
          </div>

          {/* CHARTS ROW 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Daily Sales & Received Trend */}
            <div className="card" style={{ minHeight: '340px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
                <BarChart3 size={20} color="#3b82f6" /> Daily Sales & Collection (Day-wise)
              </h3>
              {dailyChartData.length === 0 ? (
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  No entries for this month yet.
                </div>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="sales" name="Sales (₹)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="received" name="Received (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Expenses Breakdown */}
            <div className="card" style={{ minHeight: '340px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
                <PieIcon size={20} color="#ef4444" /> Expense Breakdown (ചെലവുകൾ)
              </h3>
              {categoryChartData.length === 0 ? (
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  No expenses recorded for this month.
                </div>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* CHARTS ROW 2: Multi-Month Trend */}
          {multiMonthData.length > 1 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
                <TrendingUp size={20} color="#10b981" /> Monthly Overview & Trends (മാസാമാസമുള്ള കണക്ക്)
              </h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={multiMonthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="sales" name="Sales (₹)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" name="Expenses (₹)" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal for Shop Outstanding Details */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Shop-wise Outstanding</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text)', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Shop Name</th>
                    <th>Last Date</th>
                    <th>Outstanding (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {shopDetails.map((shop, idx) => (
                    <tr key={idx}>
                      <td>{shop.name}</td>
                      <td>{shop.lastDate ? new Date(shop.lastDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge ${shop.outstanding > 0 ? 'badge-danger' : 'badge-success'}`}>
                          ₹{shop.outstanding}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {shopDetails.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{textAlign: 'center'}}>No outstanding balances found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Category-wise Expenses */}
      {showExpenseModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Category-wise Expenses</h2>
              <button onClick={() => setShowExpenseModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text)', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseDetails.map((expense, idx) => (
                    <tr key={idx}>
                      <td><span className="badge badge-warning">{expense.category}</span></td>
                      <td>
                        <span className="badge badge-danger">
                          ₹{expense.amount}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {expenseDetails.length === 0 && (
                    <tr>
                      <td colSpan="2" style={{textAlign: 'center'}}>No expenses recorded this month.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
