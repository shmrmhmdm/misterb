import React, { useState, useEffect } from 'react';
import { getShops, getProducts, addShop, editShop, deleteShop, addProduct, editProduct, deleteProduct, deleteMonthData } from '../services/api';

const Settings = () => {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [shopName, setShopName] = useState('');
  const [shopDetails, setShopDetails] = useState('');
  const [shopSubmitting, setShopSubmitting] = useState(false);
  const [editingShopRow, setEditingShopRow] = useState(null);

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [editingProductRow, setEditingProductRow] = useState(null);

  // Month bulk delete state
  const [deleteMonth, setDeleteMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [deleteType, setDeleteType] = useState('all');
  const [deletingMonth, setDeletingMonth] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [shopsData, productsData] = await Promise.all([getShops(), getProducts()]);
    
    // Process shops
    let parsedShops = [];
    if (shopsData && shopsData.length > 0) {
      const firstCell = String(shopsData[0][0]).toLowerCase();
      const hasHeader = firstCell.includes('shop');
      const startIndex = hasHeader ? 1 : 0;
      for (let i = startIndex; i < shopsData.length; i++) {
        parsedShops.push({
          rowNumber: i + 1,
          data: shopsData[i]
        });
      }
    }
    setShops(parsedShops);

    // Process products
    let parsedProducts = [];
    if (productsData && productsData.length > 0) {
      const firstCell = String(productsData[0][0]).toLowerCase();
      const hasHeader = firstCell.includes('item') || firstCell.includes('product');
      const startIndex = hasHeader ? 1 : 0;
      for (let i = startIndex; i < productsData.length; i++) {
        parsedProducts.push({
          rowNumber: i + 1,
          data: productsData[i]
        });
      }
    }
    setProducts(parsedProducts);
    
    setLoading(false);
  };

  // --- SHOP HANDLERS ---
  const handleEditShopClick = (shopObj) => {
    setShopName(shopObj.data[0] || '');
    setShopDetails(shopObj.data[1] || '');
    setEditingShopRow(shopObj.rowNumber);
  };

  const cancelEditShop = () => {
    setShopName('');
    setShopDetails('');
    setEditingShopRow(null);
  };

  const handleDeleteShop = async (rowIndex) => {
    if (window.confirm("Are you sure you want to delete this shop?")) {
      try {
        await deleteShop(rowIndex);
        if (editingShopRow === rowIndex) cancelEditShop();
        setTimeout(fetchData, 1000);
      } catch (error) {
        alert("Error deleting shop");
      }
    }
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    setShopSubmitting(true);
    try {
      if (editingShopRow) {
        await editShop(editingShopRow, { shopName, details: shopDetails });
      } else {
        await addShop({ shopName, details: shopDetails });
      }
      cancelEditShop();
      setTimeout(fetchData, 1000); // slight delay for sheet updates
    } catch (error) {
      alert(editingShopRow ? "Error updating shop" : "Error adding shop");
    }
    setShopSubmitting(false);
  };

  // --- PRODUCT HANDLERS ---
  const handleEditProductClick = (prodObj) => {
    setItemName(prodObj.data[0] || '');
    setItemPrice(prodObj.data[1] || '');
    setEditingProductRow(prodObj.rowNumber);
  };

  const cancelEditProduct = () => {
    setItemName('');
    setItemPrice('');
    setEditingProductRow(null);
  };

  const handleDeleteProduct = async (rowIndex) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(rowIndex);
        if (editingProductRow === rowIndex) cancelEditProduct();
        setTimeout(fetchData, 1000);
      } catch (error) {
        alert("Error deleting product");
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductSubmitting(true);
    try {
      if (editingProductRow) {
        await editProduct(editingProductRow, { itemName, price: itemPrice });
      } else {
        await addProduct({ itemName, price: itemPrice });
      }
      cancelEditProduct();
      setTimeout(fetchData, 1000);
    } catch (error) {
      alert(editingProductRow ? "Error updating product" : "Error adding product");
    }
    setProductSubmitting(false);
  };

  // --- MONTH BULK DELETE HANDLER ---
  const handleDeleteMonthData = async (e) => {
    e.preventDefault();
    if (!deleteMonth) {
      alert("Please select a month.");
      return;
    }

    const typeLabel = deleteType === 'all' ? 'All (Sales & Expenses)' : (deleteType === 'sales' ? 'Sales' : 'Expenses');
    const isConfirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to permanently delete all ${typeLabel} records for ${deleteMonth}?\n\nThis cannot be undone!`
    );

    if (!isConfirmed) return;

    setDeletingMonth(true);
    setDeleteFeedback('');
    try {
      await deleteMonthData(deleteMonth, deleteType);
      setDeleteFeedback(`✅ Selected ${typeLabel} data for ${deleteMonth} has been deleted successfully!`);
    } catch (error) {
      setDeleteFeedback('❌ Failed to delete month data. Please check your Google Apps Script setup.');
    }
    setDeletingMonth(false);
  };

  // Change PIN state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState('');

  const handleChangePin = (e) => {
    e.preventDefault();
    const savedPin = localStorage.getItem('misterb_pin') || '1234';

    if (currentPin !== savedPin) {
      setPinFeedback('❌ നിലവിലെ പിൻ (Current PIN) തെറ്റാണ്!');
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinFeedback('❌ പുതിയ പിൻ കൃത്യം 4 അക്കങ്ങൾ (digits) ആയിരിക്കണം!');
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinFeedback('❌ പുതിയ പിൻ കൺഫേം ചെയ്തതുമായി ഒത്തുപോകുന്നില്ല!');
      return;
    }

    localStorage.setItem('misterb_pin', newPin);
    setPinFeedback('✅ സുരക്ഷാ പിൻ വിജയകരമായി മാറ്റി!');
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
  };

  return (
    <div>
      <h1>Settings / Master Data</h1>

      {/* Security: Change App PIN */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--accent-primary)', background: 'rgba(59, 130, 246, 0.05)' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔒 Change Security PIN (സുരക്ഷാ പിൻ മാറ്റുക)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          ആപ്പ് തുറക്കുമ്പോൾ ചോദിക്കുന്ന 4-അക്ക സുരക്ഷാ പിൻ മാറ്റാൻ താഴെ വിവരങ്ങൾ നൽകുക.
        </p>

        <form onSubmit={handleChangePin}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current PIN (നിലവിലെ പിൻ)</label>
              <input 
                type="password" 
                maxLength={4}
                className="form-input" 
                placeholder="****"
                value={currentPin} 
                onChange={(e) => setCurrentPin(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New 4-Digit PIN (പുതിയ പിൻ)</label>
              <input 
                type="password" 
                maxLength={4}
                className="form-input" 
                placeholder="****"
                value={newPin} 
                onChange={(e) => setNewPin(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New PIN</label>
              <input 
                type="password" 
                maxLength={4}
                className="form-input" 
                placeholder="****"
                value={confirmNewPin} 
                onChange={(e) => setConfirmNewPin(e.target.value)} 
                required 
              />
            </div>

            <div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '10px 16px' }}
              >
                Update PIN
              </button>
            </div>
          </div>

          {pinFeedback && (
            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: pinFeedback.startsWith('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: pinFeedback.startsWith('✅') ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>
              {pinFeedback}
            </div>
          )}
        </form>
      </div>
      
      {/* Month Data Management / Bulk Delete */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <h3 style={{ color: 'var(--danger)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🗑️ Delete Monthly Entries (മാസത്തെ വിവരങ്ങൾ ക്ലിയർ ചെയ്യുക)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          ഒരു നിർദ്ദിഷ്ട മാസത്തെ Sales അല്ലെങ്കിൽ Expenses വിവരങ്ങൾ ഒറ്റയടിക്ക് ഡിലീറ്റ് ചെയ്യാൻ താഴെ മാസം തിരഞ്ഞെടുക്കുക.
        </p>

        <form onSubmit={handleDeleteMonthData}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>Select Month (മാസം)</label>
              <input 
                type="month" 
                className="form-input" 
                value={deleteMonth} 
                onChange={(e) => setDeleteMonth(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>What to Delete (എന്താണ് ഡിലീറ്റ് ചെയ്യേണ്ടത്)</label>
              <select 
                className="form-input" 
                value={deleteType} 
                onChange={(e) => setDeleteType(e.target.value)}
              >
                <option value="all">🔴 All (Sales & Expenses)</option>
                <option value="sales">🛒 Sales Only</option>
                <option value="expenses">💸 Expenses Only</option>
              </select>
            </div>

            <div>
              <button 
                type="submit" 
                className="btn" 
                style={{ background: 'var(--danger)', color: '#fff', width: '100%', padding: '10px 16px' }}
                disabled={deletingMonth}
              >
                {deletingMonth ? 'Deleting Data...' : 'Delete Month Entries'}
              </button>
            </div>
          </div>

          {deleteFeedback && (
            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: deleteFeedback.startsWith('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: deleteFeedback.startsWith('✅') ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>
              {deleteFeedback}
            </div>
          )}
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Add/Edit Shop Card */}
        <div className="card" style={{ border: editingShopRow ? '1px solid var(--primary)' : 'none' }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '16px'}}>
            <h3 style={{margin:0}}>{editingShopRow ? 'Edit Shop' : 'Add New Shop'}</h3>
            {editingShopRow && <button type="button" onClick={cancelEditShop} className="btn" style={{background:'var(--danger)', padding: '4px 8px', fontSize: '0.8rem'}}>Cancel</button>}
          </div>
          <form onSubmit={handleShopSubmit}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input type="text" className="form-input" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Address / Details</label>
              <input type="text" className="form-input" value={shopDetails} onChange={(e) => setShopDetails(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={shopSubmitting}>
              {shopSubmitting ? (editingShopRow ? 'Updating...' : 'Adding...') : (editingShopRow ? 'Update Shop' : 'Save Shop')}
            </button>
          </form>
        </div>

        {/* Add/Edit Product Card */}
        <div className="card" style={{ border: editingProductRow ? '1px solid var(--primary)' : 'none' }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '16px'}}>
            <h3 style={{margin:0}}>{editingProductRow ? 'Edit Product' : 'Add New Product'}</h3>
            {editingProductRow && <button type="button" onClick={cancelEditProduct} className="btn" style={{background:'var(--danger)', padding: '4px 8px', fontSize: '0.8rem'}}>Cancel</button>}
          </div>
          <form onSubmit={handleProductSubmit}>
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input type="text" className="form-input" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Default Price (₹)</label>
              <input type="number" className="form-input" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={productSubmitting}>
              {productSubmitting ? (editingProductRow ? 'Updating...' : 'Adding...') : (editingProductRow ? 'Update Product' : 'Save Product')}
            </button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h3>Existing Shops</h3>
          {loading ? <p>Loading...</p> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Shop Name</th><th>Details</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {shops.map((s, idx) => (
                    <tr key={idx}>
                      <td>{s.data[0]}</td>
                      <td>{s.data[1]}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditShopClick(s)} className="btn" style={{padding:'4px 8px', fontSize:'0.8rem'}}>Edit</button>
                          <button onClick={() => handleDeleteShop(s.rowNumber)} className="btn" style={{padding:'4px 8px', fontSize:'0.8rem', background: 'var(--danger)'}}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {shops.length === 0 && <tr><td colSpan="3" style={{textAlign: 'center'}}>No shops found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Existing Products</h3>
          {loading ? <p>Loading...</p> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Item Name</th><th>Price (₹)</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.data[0]}</td>
                      <td>₹{p.data[1]}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditProductClick(p)} className="btn" style={{padding:'4px 8px', fontSize:'0.8rem'}}>Edit</button>
                          <button onClick={() => handleDeleteProduct(p.rowNumber)} className="btn" style={{padding:'4px 8px', fontSize:'0.8rem', background: 'var(--danger)'}}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan="3" style={{textAlign: 'center'}}>No products found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Settings;
