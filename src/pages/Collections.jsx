import React, { useState, useEffect, useMemo } from 'react';
import { getCollections, addCollection, editCollection, deleteCollection, getShops, getSales } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import { 
  Wallet, 
  Calendar, 
  Store, 
  User, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Search, 
  ArrowDownLeft,
  AlertCircle
} from 'lucide-react';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [shopsList, setShopsList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [editingRow, setEditingRow] = useState(null); // stores Google Sheet row index
  const [searchShop, setSearchShop] = useState('');
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    shop: '',
    amount: '',
    paymentMode: 'Cash',
    collectedBy: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const [collData, shopsData, salesData] = await Promise.all([
      getCollections(),
      getShops(),
      getSales()
    ]);

    // Process collections with row numbers for editing
    let parsedCollections = [];
    if (collData && collData.length > 0) {
      const firstCell = String(collData[0][0]).toLowerCase();
      const hasHeader = (firstCell === 'date');
      const startIndex = hasHeader ? 1 : 0;

      for (let i = startIndex; i < collData.length; i++) {
        parsedCollections.push({
          rowNumber: i + 1,
          data: collData[i]
        });
      }
    }
    setCollections(parsedCollections.reverse()); // latest first

    // Process shops
    if (shopsData && shopsData.length > 0) {
      const firstCell = String(shopsData[0][0]).toLowerCase();
      if (firstCell.includes('shop')) setShopsList(shopsData.slice(1));
      else setShopsList(shopsData);
    } else {
      setShopsList([]);
    }

    // Process sales for calculating live shop outstanding
    let validSales = [];
    if (salesData && salesData.length > 0) {
      const firstCell = String(salesData[0][0]).toLowerCase();
      validSales = (firstCell === 'date') ? salesData.slice(1) : salesData;
    }
    setSalesList(validSales);

    setLoading(false);
  };

  // Map each shop to its overall Outstanding Balance
  const shopOutstandingMap = useMemo(() => {
    const map = {};

    // 1. Add up sales and cash at sale
    salesList.forEach(row => {
      const shopName = (row[1] || '').trim();
      if (!shopName) return;
      const price = Number(row[4]) || 0;
      const cashReceived = Number(row[6]) || 0;
      if (!map[shopName]) map[shopName] = { sales: 0, received: 0 };
      map[shopName].sales += price;
      map[shopName].received += cashReceived;
    });

    // 2. Add up all collections
    collections.forEach(item => {
      const shopName = (item.data[1] || '').trim();
      if (!shopName) return;
      const amount = Number(item.data[2]) || 0;
      if (!map[shopName]) map[shopName] = { sales: 0, received: 0 };
      map[shopName].received += amount;
    });

    const resultMap = {};
    Object.keys(map).forEach(shop => {
      resultMap[shop] = map[shop].sales - map[shop].received;
    });
    return resultMap;
  }, [salesList, collections]);

  const selectedShopOutstanding = useMemo(() => {
    if (!formData.shop) return 0;
    return shopOutstandingMap[formData.shop.trim()] || 0;
  }, [formData.shop, shopOutstandingMap]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShopSelect = (e) => {
    const shop = e.target.value;
    setFormData({ ...formData, shop });
  };

  const handleFillOutstanding = () => {
    if (selectedShopOutstanding > 0) {
      setFormData(prev => ({ ...prev, amount: selectedShopOutstanding }));
    }
  };

  const handleEditClick = (collObj) => {
    let dateStr = collObj.data[0];
    if (dateStr && new Date(dateStr).toString() !== 'Invalid Date') {
      const d = new Date(dateStr);
      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    setFormData({
      date: dateStr || new Date().toISOString().split('T')[0],
      shop: collObj.data[1] || '',
      amount: collObj.data[2] || '',
      paymentMode: collObj.data[3] || 'Cash',
      collectedBy: collObj.data[4] || '',
      notes: collObj.data[5] || ''
    });
    setEditingRow(collObj.rowNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData(initialFormState);
    setEditingRow(null);
  };

  const handleDeleteClick = async (rowIndex) => {
    if (window.confirm('Are you sure you want to delete this collection record?')) {
      try {
        await deleteCollection(rowIndex);
        setFeedback({ type: 'success', message: 'Collection entry deleted successfully.' });
        if (editingRow === rowIndex) cancelEdit();
        fetchAllData();
      } catch (error) {
        setFeedback({ type: 'error', message: 'Failed to delete collection.' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shop) {
      alert('Please select a shop.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid collection amount.');
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingRow) {
        await editCollection(editingRow, formData);
        setFeedback({ type: 'success', message: '✅ Collection entry updated successfully!' });
      } else {
        await addCollection(formData);
        setFeedback({ type: 'success', message: '✅ Collection entry saved successfully!' });
      }
      setFormData(initialFormState);
      setEditingRow(null);
      fetchAllData();
    } catch (error) {
      setFeedback({ type: 'error', message: '❌ Error saving collection data. Please try again.' });
    }
    setSubmitting(false);
  };

  // Filtered collections for list
  const filteredCollections = useMemo(() => {
    return collections.filter(item => {
      const row = item.data;
      const dateStr = row[0] ? new Date(row[0]).toISOString().split('T')[0] : '';
      const shopName = (row[1] || '').toLowerCase();

      const matchesShop = !searchShop || shopName.includes(searchShop.toLowerCase());
      const matchesMonth = !filterMonth || dateStr.startsWith(filterMonth);

      return matchesShop && matchesMonth;
    });
  }, [collections, searchShop, filterMonth]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let todayTotal = 0;
    let monthTotal = 0;
    let countMonth = 0;

    collections.forEach(item => {
      const row = item.data;
      const dateStr = row[0] ? new Date(row[0]).toISOString().split('T')[0] : '';
      const amount = Number(row[2]) || 0;

      if (dateStr === todayStr) {
        todayTotal += amount;
      }
      if (filterMonth && dateStr.startsWith(filterMonth)) {
        monthTotal += amount;
        countMonth += 1;
      }
    });

    return { todayTotal, monthTotal, countMonth };
  }, [collections, filterMonth]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet color="var(--accent-color)" size={28} />
            Due Collections
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Record and manage due payment collections from shops
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid-responsive" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#10b981' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Today's Collections</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: '#10b981' }}>
              ₹{summaryMetrics.todayTotal.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '12px', color: '#3b82f6' }}>
            <Calendar size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Month Collections ({filterMonth})</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: '#3b82f6' }}>
              ₹{summaryMetrics.monthTotal.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '12px', color: '#8b5cf6' }}>
            <FileText size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Entries This Month</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: '#8b5cf6' }}>
              {summaryMetrics.countMonth} Receipts
            </h3>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: feedback.type === 'success' ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.95rem'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Entry Form Card */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingRow ? <Edit2 size={20} color="var(--warning)" /> : <PlusCircle size={20} color="var(--accent-color)" />}
            {editingRow ? `Edit Collection Entry (Row #${editingRow})` : 'New Due Collection Entry'}
          </h3>
          {editingRow && (
            <button className="btn" onClick={cancelEdit} style={{ background: 'var(--glass-bg)', fontSize: '0.85rem', padding: '6px 12px' }}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-responsive" style={{ gap: '16px' }}>
            
            {/* Date Field */}
            <div className="form-group">
              <label>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Date
              </label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Shop Selection with Live Outstanding Indicator */}
            <div className="form-group">
              <label>
                <Store size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Shop Name
              </label>
              <SearchableSelect
                name="shop"
                options={shopsList.map((shop) => {
                  const sName = shop[0];
                  const due = shopOutstandingMap[sName] || 0;
                  return {
                    value: sName,
                    label: `${sName} ${due > 0 ? `(Due: ₹${due.toLocaleString()})` : (due < 0 ? `(Advance: ₹${Math.abs(due)})` : '(No Due)')}`
                  };
                })}
                value={formData.shop}
                onChange={handleShopSelect}
                placeholder="-- Select Shop --"
                searchPlaceholder="Search shop name or due..."
                required
              />
            </div>

            {/* Amount Field */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Amount Received (₹)</label>
                {formData.shop && selectedShopOutstanding > 0 && (
                  <button 
                    type="button" 
                    onClick={handleFillOutstanding}
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      color: '#3b82f6',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Full Due: ₹{selectedShopOutstanding.toLocaleString()}
                  </button>
                )}
              </div>
              <input 
                type="number" 
                name="amount" 
                placeholder="₹ Amount" 
                value={formData.amount} 
                onChange={handleChange} 
                min="1"
                step="any"
                required 
              />
            </div>

            {/* Payment Mode */}
            <div className="form-group">
              <label>
                <CreditCard size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Payment Mode
              </label>
              <select 
                name="paymentMode" 
                value={formData.paymentMode} 
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="GPay / UPI">Google Pay / PhonePe / UPI</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Collected By */}
            <div className="form-group">
              <label>
                <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Collected By
              </label>
              <input 
                type="text" 
                name="collectedBy" 
                placeholder="Salesman / Collector name" 
                value={formData.collectedBy} 
                onChange={handleChange} 
              />
            </div>

            {/* Notes / Remarks */}
            <div className="form-group">
              <label>
                <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Notes / Remarks
              </label>
              <input 
                type="text" 
                name="notes" 
                placeholder="Optional notes or invoice reference" 
                value={formData.notes} 
                onChange={handleChange} 
              />
            </div>

          </div>

          {/* Shop Live Due Banner */}
          {formData.shop && (
            <div style={{
              background: selectedShopOutstanding > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${selectedShopOutstanding > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              borderRadius: '8px',
              padding: '10px 14px',
              margin: '16px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.9rem'
            }}>
              <span>
                <strong>{formData.shop}</strong> - Current Outstanding:
              </span>
              <strong style={{ fontSize: '1.05rem', color: selectedShopOutstanding > 0 ? '#ef4444' : '#10b981' }}>
                ₹{selectedShopOutstanding.toLocaleString()}
              </strong>
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
              style={{ flex: 1, padding: '12px 20px', fontSize: '1rem' }}
            >
              {submitting ? 'Saving Data...' : (editingRow ? 'Update Collection' : 'Save Collection')}
            </button>
            {editingRow && (
              <button 
                type="button" 
                className="btn" 
                onClick={cancelEdit} 
                style={{ background: 'var(--glass-bg)', padding: '12px 20px' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Collection History Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowDownLeft size={20} color="#10b981" />
            Collection History
          </h3>

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
            
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ fontSize: '0.85rem', width: 'auto' }}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Loading collections from Google Sheets...
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shop</th>
                  <th>Amount Received</th>
                  <th>Payment Mode</th>
                  <th>Collected By</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollections.map((coll) => {
                  const row = coll.data;
                  const dateStr = row[0] ? new Date(row[0]).toLocaleDateString('en-GB') : '-';
                  return (
                    <tr key={coll.rowNumber}>
                      <td>{dateStr}</td>
                      <td><strong>{row[1]}</strong></td>
                      <td>
                        <span style={{ fontWeight: '700', color: '#10b981', fontSize: '1rem' }}>
                          ₹{Number(row[2] || 0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                          {row[3] || 'Cash'}
                        </span>
                      </td>
                      <td>{row[4] || '-'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{row[5] || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="btn" 
                            onClick={() => handleEditClick(coll)}
                            style={{ padding: '6px 8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                            title="Edit entry"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn" 
                            onClick={() => handleDeleteClick(coll.rowNumber)}
                            style={{ padding: '6px 8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                            title="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredCollections.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No collection records found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
