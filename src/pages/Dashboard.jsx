import React, { useState, useEffect } from 'react';
import { getSales, getExpenses, getLedger } from '../services/api';

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

  // We need to keep the raw data so we don't refetch on month change
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

  const calculateSummary = (salesData, expensesData, ledgerData, monthStr) => {
    let totalSales = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;
    let totalExpenses = 0;

    // Helper to check if a date string matches the selected YYYY-MM
    const isSameMonth = (dateString) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return false; // Invalid date
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

    // Outstanding is usually calculated across ALL time, so we don't filter it by month
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
          const category = row[1] || 'Uncategorized';
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
      
      {loading ? <p>Loading summary data...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Sales (This Month)</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalSales}</p>
          </div>
          <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Received (This Month)</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalReceived}</p>
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
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalExpenses}</p>
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
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalOutstanding}</p>
          </div>
          
          <div className="card" style={{ background: 'rgba(99, 102, 241, 0.1)', borderLeft: '4px solid #6366f1', gridColumn: '1 / -1' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Net Cash (This Month)</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: summary.netCash >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              ₹{summary.netCash}
            </p>
          </div>
        </div>
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
