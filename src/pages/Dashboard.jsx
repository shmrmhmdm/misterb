import React, { useState, useEffect, useMemo } from 'react';
import { getSales, getExpenses, getLedger, getCollections, getShops, getProducts, getUsers } from '../services/api';
import { formatDriveImageUrl } from '../utils/imageHelper';
import UserAvatar from '../components/UserAvatar';
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
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Calendar, 
  Wallet, 
  Users, 
  UserCheck, 
  ShoppingBag, 
  ArrowDownLeft, 
  DollarSign, 
  CheckCircle2,
  Store,
  Package,
  Search,
  Building2
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginTop: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color || entry.fill }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
            <span style={{ fontWeight: '600', color: '#fff' }}>₹{Number(entry.value).toLocaleString()}</span>
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
    cashAtSale: 0,
    dueCollections: 0,
    totalReceived: 0,
    totalOutstanding: 0,
    totalExpenses: 0,
    netCash: 0,
    totalShopsCount: 0,
    totalProductsCount: 0
  });
  
  const [shopDetails, setShopDetails] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [allShopsList, setAllShopsList] = useState([]);
  const [allProductsList, setAllProductsList] = useState([]);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedStaffModal, setSelectedStaffModal] = useState(null);
  const [showShopsModal, setShowShopsModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);

  // Search states for modals
  const [shopSearch, setShopSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Raw data from Google Sheets
  const [rawData, setRawData] = useState({ sales: [], expenses: [], ledger: [], collections: [], shops: [], products: [], users: [] });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && rawData.sales.length >= 0) {
      calculateSummary(rawData.sales, rawData.expenses, rawData.ledger, rawData.collections, rawData.shops, rawData.products, selectedMonth);
    }
  }, [selectedMonth, rawData]);

  const fetchData = async () => {
    setLoading(true);
    const [salesData, expensesData, ledgerData, collectionsData, shopsData, productsData, usersData] = await Promise.all([
      getSales(), getExpenses(), getLedger(), getCollections(), getShops(), getProducts(), getUsers()
    ]);
    
    setRawData({ sales: salesData, expenses: expensesData, ledger: ledgerData, collections: collectionsData, shops: shopsData, products: productsData, users: usersData });
    setLoading(false);
  };

  // Helper to parse date string
  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const calculateSummary = (salesData, expensesData, ledgerData, collectionsData, shopsData, productsData, monthStr) => {
    let totalSales = 0;
    let cashAtSale = 0;
    let dueCollections = 0;
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
      if (firstCell === 'date') validSales = salesData.slice(1);
      else validSales = salesData;
    }

    let validExpenses = [];
    if (expensesData && expensesData.length > 0) {
      const firstCell = String(expensesData[0][0]).toLowerCase();
      if (firstCell === 'date') validExpenses = expensesData.slice(1);
      else validExpenses = expensesData;
    }

    let validCollections = [];
    if (collectionsData && collectionsData.length > 0) {
      const firstCell = String(collectionsData[0][0]).toLowerCase();
      if (firstCell === 'date') validCollections = collectionsData.slice(1);
      else validCollections = collectionsData;
    }

    // Month sales & cash at sale
    if (validSales.length > 0) {
      validSales.forEach(row => {
        if (isSameMonth(row[0])) {
          totalSales += Number(row[4]) || 0;
          cashAtSale += Number(row[6]) || 0;
        }
      });
    }

    // Month due collections
    if (validCollections.length > 0) {
      validCollections.forEach(row => {
        if (isSameMonth(row[0])) {
          dueCollections += Number(row[2]) || 0;
        }
      });
    }

    const totalReceived = cashAtSale + dueCollections;

    // Outstanding calculated across all time including sales & collections
    const shopOutstandings = {};
    let allSales = 0;
    let allReceived = 0;

    if (validSales.length > 0) {
       validSales.forEach(row => {
          const date = row[0];
          const shop = (row[1] || '').trim();
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
    }

    if (validCollections.length > 0) {
      validCollections.forEach(row => {
        const date = row[0];
        const shop = (row[1] || '').trim();
        const amount = Number(row[2]) || 0;

        allReceived += amount;
        if (shop) {
          if (!shopOutstandings[shop]) {
            shopOutstandings[shop] = { outstanding: 0, lastDate: date };
          }
          shopOutstandings[shop].outstanding -= amount;
          if (date) shopOutstandings[shop].lastDate = date;
        }
      });
    }

    const totalOutstanding = allSales - allReceived;
    
    const formattedShopDetails = Object.keys(shopOutstandings)
      .map(shop => ({
         name: shop,
         outstanding: shopOutstandings[shop].outstanding,
         lastDate: shopOutstandings[shop].lastDate
      }))
      .filter(s => s.outstanding !== 0)
      .sort((a, b) => b.outstanding - a.outstanding); 

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

    // Process All Registered Shops
    let parsedAllShops = [];
    if (shopsData && shopsData.length > 0) {
      const firstCell = String(shopsData[0][0] || '').toLowerCase();
      const hasHeader = firstCell.includes('shop');
      const startIdx = hasHeader ? 1 : 0;
      for (let i = startIdx; i < shopsData.length; i++) {
        const sName = String(shopsData[i][0] || '').trim();
        const sDetails = shopsData[i][1] || '';
        if (sName) {
          const shopOut = shopOutstandings[sName]?.outstanding || 0;
          let shopMonthSales = 0;
          let shopAllTimeSales = 0;
          let shopOrdersCount = 0;

          validSales.forEach(row => {
            if (String(row[1] || '').trim().toLowerCase() === sName.toLowerCase()) {
              const price = Number(row[4]) || 0;
              shopAllTimeSales += price;
              shopOrdersCount++;
              if (isSameMonth(row[0])) {
                shopMonthSales += price;
              }
            }
          });

          parsedAllShops.push({
            name: sName,
            details: sDetails,
            outstanding: shopOut,
            monthSales: shopMonthSales,
            allTimeSales: shopAllTimeSales,
            ordersCount: shopOrdersCount
          });
        }
      }
    }

    // Process All Registered Products/Items
    let parsedAllProducts = [];
    if (productsData && productsData.length > 0) {
      const firstCell = String(productsData[0][0] || '').toLowerCase();
      const hasHeader = firstCell.includes('item') || firstCell.includes('product');
      const startIdx = hasHeader ? 1 : 0;
      for (let i = startIdx; i < productsData.length; i++) {
        const pName = String(productsData[i][0] || '').trim();
        const pPrice = Number(productsData[i][1]) || 0;
        if (pName) {
          let monthQty = 0;
          let monthRevenue = 0;
          let allTimeQty = 0;
          let allTimeRevenue = 0;

          validSales.forEach(row => {
            if (String(row[2] || '').trim().toLowerCase() === pName.toLowerCase()) {
              const qty = Number(row[3]) || 0;
              const price = Number(row[4]) || 0;
              allTimeQty += qty;
              allTimeRevenue += price;
              if (isSameMonth(row[0])) {
                monthQty += qty;
                monthRevenue += price;
              }
            }
          });

          parsedAllProducts.push({
            name: pName,
            price: pPrice,
            monthQty,
            monthRevenue,
            allTimeQty,
            allTimeRevenue
          });
        }
      }
    }

    const netCash = totalReceived - totalExpenses;
    setSummary({
      totalSales,
      cashAtSale,
      dueCollections,
      totalReceived,
      totalOutstanding,
      totalExpenses,
      netCash,
      totalShopsCount: parsedAllShops.length,
      totalProductsCount: parsedAllProducts.length
    });
    setShopDetails(formattedShopDetails);
    setExpenseDetails(formattedExpenseDetails);
    setAllShopsList(parsedAllShops);
    setAllProductsList(parsedAllProducts);
  };

  // --- CHART 1: Daily Trend in Selected Month ---
  const dailyChartData = useMemo(() => {
    let validSales = rawData.sales?.length ? (String(rawData.sales[0][0]).toLowerCase().includes('date') ? rawData.sales.slice(1) : rawData.sales) : [];
    let validExpenses = rawData.expenses?.length ? (String(rawData.expenses[0][0]).toLowerCase().includes('date') ? rawData.expenses.slice(1) : rawData.expenses) : [];
    let validCollections = rawData.collections?.length ? (String(rawData.collections[0][0]).toLowerCase().includes('date') ? rawData.collections.slice(1) : rawData.collections) : [];

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

    validCollections.forEach(row => {
      const d = parseDateStr(row[0]);
      if (!d) return;
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (mStr === selectedMonth) {
        const dayKey = `${String(d.getDate()).padStart(2, '0')}`;
        if (!dailyMap[dayKey]) dailyMap[dayKey] = { day: dayKey, sales: 0, received: 0, expenses: 0 };
        dailyMap[dayKey].received += Number(row[2]) || 0;
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
    let validCollections = rawData.collections?.length ? (String(rawData.collections[0][0]).toLowerCase().includes('date') ? rawData.collections.slice(1) : rawData.collections) : [];

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

    validCollections.forEach(row => {
      const d = parseDateStr(row[0]);
      if (!d) return;
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthMap[mKey]) monthMap[mKey] = { month: mLabel, key: mKey, sales: 0, expenses: 0, received: 0 };
      monthMap[mKey].received += Number(row[2]) || 0;
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

  // Calculate Staff-wise Cash Breakdown (Sale by Cash + Collected by Cash)
  const staffCashData = useMemo(() => {
    if (!rawData) return { staffList: [], totalSaleCash: 0, totalDueColl: 0, grandTotal: 0 };
    const { sales, collections, users } = rawData;

    // Build user image and role lookup map
    const userMap = {};
    if (users && users.length > 0) {
      const firstCell = String(users[0][0] || '').toLowerCase();
      const hasHeader = firstCell.includes('phone') || firstCell.includes('mobile') || firstCell.includes('number');
      const startIndex = hasHeader ? 1 : 0;
      for (let i = startIndex; i < users.length; i++) {
        const uName = String(users[i][1] || '').trim();
        const uRole = String(users[i][2] || 'Staff').trim();
        const uPhoto = formatDriveImageUrl(users[i][4] || '');
        if (uName) {
          userMap[uName.toLowerCase()] = { photo: uPhoto, role: uRole };
        }
      }
    }

    const isSameMonth = (dateString) => {
      const d = parseDateStr(dateString);
      if (!d) return false;
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return m === selectedMonth;
    };

    let validSales = [];
    if (sales && sales.length > 0) {
      const firstCell = String(sales[0][0]).toLowerCase();
      validSales = (firstCell === 'date') ? sales.slice(1) : sales;
    }

    let validCollections = [];
    if (collections && collections.length > 0) {
      const firstCell = String(collections[0][0]).toLowerCase();
      validCollections = (firstCell === 'date') ? collections.slice(1) : collections;
    }

    const staffMap = {};
    let totalSaleCash = 0;
    let totalDueColl = 0;

    // 1. Process sales cash (Sale By -> row[5], Cash Received -> row[6])
    validSales.forEach(row => {
      if (isSameMonth(row[0])) {
        const staffName = (row[5] || '').trim() || 'Unassigned';
        const cash = Number(row[6]) || 0;
        const price = Number(row[4]) || 0;
        const shop = (row[1] || '').trim();
        const date = row[0];

        if (!staffMap[staffName]) {
          staffMap[staffName] = {
            name: staffName,
            saleCash: 0,
            dueCollections: 0,
            totalCash: 0,
            salesCount: 0,
            collectionsCount: 0,
            transactions: []
          };
        }

        staffMap[staffName].saleCash += cash;
        totalSaleCash += cash;
        if (cash > 0) staffMap[staffName].salesCount += 1;

        if (cash > 0) {
          staffMap[staffName].transactions.push({
            type: 'Sale Cash',
            date: date,
            shop: shop,
            amount: cash,
            item: row[2] || '',
            notes: `Item: ${row[2] || '-'} (Total: ₹${price})`
          });
        }
      }
    });

    // 2. Process due collections cash (Collected By -> row[4], Amount -> row[2])
    validCollections.forEach(row => {
      if (isSameMonth(row[0])) {
        const staffName = (row[4] || '').trim() || 'Unassigned';
        const amount = Number(row[2]) || 0;
        const shop = (row[1] || '').trim();
        const date = row[0];
        const mode = row[3] || 'Cash';
        const notes = row[5] || '';

        if (!staffMap[staffName]) {
          staffMap[staffName] = {
            name: staffName,
            saleCash: 0,
            dueCollections: 0,
            totalCash: 0,
            salesCount: 0,
            collectionsCount: 0,
            transactions: []
          };
        }

        staffMap[staffName].dueCollections += amount;
        totalDueColl += amount;
        if (amount > 0) staffMap[staffName].collectionsCount += 1;

        if (amount > 0) {
          staffMap[staffName].transactions.push({
            type: 'Due Collection',
            date: date,
            shop: shop,
            amount: amount,
            mode: mode,
            notes: notes || mode
          });
        }
      }
    });

    const staffList = Object.values(staffMap).map(s => {
      const totalCash = s.saleCash + s.dueCollections;
      const matchedUser = userMap[s.name.toLowerCase()] || {};
      return {
        ...s,
        photo: matchedUser.photo || '',
        role: matchedUser.role || 'Staff',
        totalCash,
        transactions: s.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      };
    }).filter(s => s.totalCash > 0)
      .sort((a, b) => b.totalCash - a.totalCash);

    const grandTotal = totalSaleCash + totalDueColl;

    return { staffList, totalSaleCash, totalDueColl, grandTotal };
  }, [rawData, selectedMonth]);

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
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Cash Inflow (This Month)</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{summary.totalReceived.toLocaleString()}</p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Sale: ₹{summary.cashAtSale.toLocaleString()} | Due: ₹{summary.dueCollections.toLocaleString()}
              </div>
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

            {/* Total Shops Card */}
            <div 
              className="card" 
              style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '4px solid #38bdf8', cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => setShowShopsModal(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Click to view all shops list"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Total Shops <small style={{fontSize:'0.7rem'}}>(Click details)</small></h3>
                <Store size={20} color="#38bdf8" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '8px 0 0 0', color: '#38bdf8' }}>{summary.totalShopsCount}</p>
            </div>

            {/* Total Items Card */}
            <div 
              className="card" 
              style={{ background: 'rgba(236, 72, 153, 0.1)', borderLeft: '4px solid #ec4899', cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => setShowProductsModal(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Click to view all items list"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Total Items <small style={{fontSize:'0.7rem'}}>(Click details)</small></h3>
                <Package size={20} color="#ec4899" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '8px 0 0 0', color: '#ec4899' }}>{summary.totalProductsCount}</p>
            </div>
            
            <div className="card" style={{ background: 'rgba(99, 102, 241, 0.1)', borderLeft: '4px solid #6366f1', gridColumn: '1 / -1' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Net Cash (This Month)</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: summary.netCash >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ₹{summary.netCash.toLocaleString()}
              </p>
            </div>
          </div>

          {/* STAFF CASH IN HAND / COLLECTIONS BREAKDOWN SECTION */}
          <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  <Users size={22} color="#10b981" />
                  Staff Cash in Hand & Collections
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Cash received during sales (Sale By) & due payments collected later (Collected By)
                </p>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Month Total:</span>
                <strong style={{ color: '#10b981', fontSize: '1.15rem' }}>₹{staffCashData.grandTotal.toLocaleString()}</strong>
              </div>
            </div>

            {staffCashData.staffList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No staff cash collections recorded for {selectedMonth}.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {staffCashData.staffList.map((staff, idx) => {
                  const percent = staffCashData.grandTotal > 0 ? ((staff.totalCash / staffCashData.grandTotal) * 100).toFixed(1) : 0;
                  return (
                    <div 
                      key={idx}
                      className="card"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setSelectedStaffModal(staff)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <UserAvatar photo={staff.photo} name={staff.name} size={42} />
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{staff.name}</h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {staff.role || 'Staff'} • {staff.transactions.length} entries
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Cash in Hand</span>
                            <strong style={{ fontSize: '1.25rem', color: '#10b981' }}>
                              ₹{staff.totalCash.toLocaleString()}
                            </strong>
                          </div>
                        </div>

                        {/* Breakdown Badges */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            borderRadius: '8px',
                            padding: '8px 10px'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShoppingBag size={12} /> Sale By
                            </span>
                            <strong style={{ fontSize: '0.95rem', color: '#60a5fa', display: 'block', marginTop: '2px' }}>
                              ₹{staff.saleCash.toLocaleString()}
                            </strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              ({staff.salesCount} sales)
                            </span>
                          </div>

                          <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: '8px',
                            padding: '8px 10px'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ArrowDownLeft size={12} /> Collected By
                            </span>
                            <strong style={{ fontSize: '0.95rem', color: '#34d399', display: 'block', marginTop: '2px' }}>
                              ₹{staff.dueCollections.toLocaleString()}
                            </strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              ({staff.collectionsCount} collections)
                            </span>
                          </div>
                        </div>

                        {/* Percentage Bar */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', height: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                          <div style={{ background: 'var(--accent-gradient)', height: '100%', width: `${Math.min(percent, 100)}%` }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingTop: '4px' }}>
                        <span>{percent}% of Cash Inflow</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          View Details →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CHARTS ROW 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
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
                <PieIcon size={20} color="#ef4444" /> Expense Breakdown
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
                <TrendingUp size={20} color="#10b981" /> Monthly Overview & Trends
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

      {/* Modal for Staff Cash Breakdown & Transaction History */}
      {selectedStaffModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 1000, padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <UserAvatar photo={selectedStaffModal.photo} name={selectedStaffModal.name} size={48} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                    {selectedStaffModal.name}
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {selectedStaffModal.role || 'Staff'} • Cash in hand & collection breakdown for {selectedMonth}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStaffModal(null)} 
                style={{ background: 'none', border: 'none', fontSize: '1.8rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Metric Summary inside Modal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShoppingBag size={12} /> Sale By Cash
                </span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#60a5fa', marginTop: '2px' }}>
                  ₹{selectedStaffModal.saleCash.toLocaleString()}
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {selectedStaffModal.salesCount} sales
                </span>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowDownLeft size={12} /> Collected By
                </span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#34d399', marginTop: '2px' }}>
                  ₹{selectedStaffModal.dueCollections.toLocaleString()}
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {selectedStaffModal.collectionsCount} collections
                </span>
              </div>

              <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wallet size={12} /> Total Cash in Hand
                </span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#a78bfa', marginTop: '2px' }}>
                  ₹{selectedStaffModal.totalCash.toLocaleString()}
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Total Collected
                </span>
              </div>
            </div>

            {/* Transactions Table */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
              Detailed Transactions ({selectedStaffModal.transactions.length})
            </h4>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Shop</th>
                    <th>Amount</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStaffModal.transactions.map((tx, idx) => (
                    <tr key={idx}>
                      <td>{tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : '-'}</td>
                      <td>
                        <span className="badge" style={{
                          background: tx.type === 'Sale Cash' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: tx.type === 'Sale Cash' ? '#60a5fa' : '#34d399'
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td><strong>{tx.shop || '-'}</strong></td>
                      <td style={{ fontWeight: '700', color: '#10b981' }}>
                        ₹{tx.amount.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {tx.notes || '-'}
                      </td>
                    </tr>
                  ))}
                  {selectedStaffModal.transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        No transactions recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for All Registered Shops */}
      {showShopsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 1000, padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', maxHeight: '85vh', overflowY: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.3rem' }}>
                  <Store size={24} color="#38bdf8" />
                  <span>All Registered Shops ({allShopsList.length})</span>
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Complete directory of registered shops and their sales & outstanding performance
                </span>
              </div>
              <button 
                onClick={() => {
                  setShowShopsModal(false);
                  setShopSearch('');
                }} 
                style={{ background: 'none', border: 'none', fontSize: '1.8rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search shop by name or address/phone..."
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.95rem' }}
              />
            </div>

            {/* Shops Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Shop Name</th>
                    <th>Address / Contact</th>
                    <th>Orders</th>
                    <th>Month Sales (₹)</th>
                    <th>Outstanding (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {allShopsList
                    .filter(s => {
                      const q = shopSearch.toLowerCase();
                      return s.name.toLowerCase().includes(q) || (s.details && s.details.toLowerCase().includes(q));
                    })
                    .map((shop, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{shop.name}</strong>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {shop.details || '-'}
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                            {shop.ordersCount}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600', color: '#60a5fa' }}>
                          ₹{shop.monthSales.toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${shop.outstanding > 0 ? 'badge-danger' : 'badge-success'}`}>
                            ₹{shop.outstanding.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {allShopsList.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        No shops registered yet.
                      </td>
                    </tr>
                  )}
                  {allShopsList.length > 0 && allShopsList.filter(s => {
                    const q = shopSearch.toLowerCase();
                    return s.name.toLowerCase().includes(q) || (s.details && s.details.toLowerCase().includes(q));
                  }).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        No matching shops found for "{shopSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for All Products / Items */}
      {showProductsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 1000, padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', maxHeight: '85vh', overflowY: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.3rem' }}>
                  <Package size={24} color="#ec4899" />
                  <span>All Items & Products ({allProductsList.length})</span>
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Product catalog with default prices and monthly sales performance
                </span>
              </div>
              <button 
                onClick={() => {
                  setShowProductsModal(false);
                  setProductSearch('');
                }} 
                style={{ background: 'none', border: 'none', fontSize: '1.8rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search item by name..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.95rem' }}
              />
            </div>

            {/* Products Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Default Price (₹)</th>
                    <th>Qty Sold (Month)</th>
                    <th>Revenue (Month)</th>
                    <th>All-Time Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {allProductsList
                    .filter(p => {
                      const q = productSearch.toLowerCase();
                      return p.name.toLowerCase().includes(q);
                    })
                    .map((prod, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{prod.name}</strong>
                        </td>
                        <td style={{ fontWeight: '600', color: '#ec4899' }}>
                          ₹{prod.price.toLocaleString()}
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                            {prod.monthQty} units
                          </span>
                        </td>
                        <td style={{ fontWeight: '600', color: '#10b981' }}>
                          ₹{prod.monthRevenue.toLocaleString()}
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                            {prod.allTimeQty} units
                          </span>
                        </td>
                      </tr>
                    ))}
                  {allProductsList.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        No items registered in catalog yet.
                      </td>
                    </tr>
                  )}
                  {allProductsList.length > 0 && allProductsList.filter(p => {
                    const q = productSearch.toLowerCase();
                    return p.name.toLowerCase().includes(q);
                  }).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        No matching items found for "{productSearch}".
                      </td>
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
