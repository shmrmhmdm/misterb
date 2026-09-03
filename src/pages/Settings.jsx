import React, { useState, useEffect } from 'react';
import { getShops, getProducts, addShop, editShop, deleteShop, addProduct, editProduct, deleteProduct, deleteMonthData, getUsers, addUser, editUser, deleteUser } from '../services/api';
import { formatDriveImageUrl } from '../utils/imageHelper';
import { ShieldCheck, UserPlus, Phone, Trash2, Edit2, RefreshCw, Image } from 'lucide-react';

const Settings = () => {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User Management State
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('Staff');
  const [userStatus, setUserStatus] = useState('Active');
  const [userPhoto, setUserPhoto] = useState('');
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [editingUserRow, setEditingUserRow] = useState(null);
  const [userFeedback, setUserFeedback] = useState('');

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
    const [shopsData, productsData, usersData] = await Promise.all([getShops(), getProducts(), getUsers()]);
    
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

    // Process users
    let parsedUsers = [];
    if (usersData && usersData.length > 0) {
      const firstCell = String(usersData[0][0]).toLowerCase();
      const hasHeader = firstCell.includes('phone') || firstCell.includes('mobile') || firstCell.includes('number');
      const startIndex = hasHeader ? 1 : 0;
      for (let i = startIndex; i < usersData.length; i++) {
        parsedUsers.push({
          rowNumber: i + 1,
          data: usersData[i]
        });
      }
    }
    setUsers(parsedUsers);
    
    setLoading(false);
  };

  // --- USER HANDLERS ---
  const handleEditUserClick = (uObj) => {
    setUserPhone(uObj.data[0] || '');
    setUserName(uObj.data[1] || '');
    setUserRole(uObj.data[2] || 'Staff');
    setUserStatus(uObj.data[3] || 'Active');
    setUserPhoto(uObj.data[4] || '');
    setEditingUserRow(uObj.rowNumber);
  };

  const cancelEditUser = () => {
    setUserPhone('');
    setUserName('');
    setUserRole('Staff');
    setUserStatus('Active');
    setUserPhoto('');
    setEditingUserRow(null);
  };

  const handleDeleteUser = async (rowIndex) => {
    if (window.confirm("Are you sure you want to remove this authorized number?")) {
      try {
        await deleteUser(rowIndex);
        if (editingUserRow === rowIndex) cancelEditUser();
        setUserFeedback('✅ Number deleted successfully!');
        setTimeout(fetchData, 1000);
      } catch (error) {
        setUserFeedback('❌ Error deleting number');
      }
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserSubmitting(true);
    setUserFeedback('');
    try {
      if (editingUserRow) {
        await editUser(editingUserRow, { phone: userPhone, name: userName, role: userRole, status: userStatus, photo: userPhoto });
        setUserFeedback('✅ Authorized number updated successfully!');
      } else {
        await addUser({ phone: userPhone, name: userName, role: userRole, status: userStatus, photo: userPhoto });
        setUserFeedback('✅ Authorized number added successfully!');
      }
      cancelEditUser();
      setTimeout(fetchData, 1000);
    } catch (error) {
      setUserFeedback('❌ Error saving user number');
    }
    setUserSubmitting(false);
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
      setPinFeedback('❌ Current PIN is incorrect!');
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinFeedback('❌ New PIN must be exactly 4 digits!');
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinFeedback('❌ New PIN and Confirm PIN do not match!');
      return;
    }

    localStorage.setItem('misterb_pin', newPin);
    setPinFeedback('✅ Security PIN updated successfully!');
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
  };

  return (
    <div>
      <h1>Settings / Master Data</h1>

      {/* Security: Google Sheet Authorized Phone Numbers */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--accent-primary)', background: 'rgba(59, 130, 246, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ color: 'var(--accent-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} />
            <span>🔐 Authorized Login Numbers (Google Sheets)</span>
          </h3>
          <button 
            type="button" 
            onClick={fetchData} 
            className="btn" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--glass-bg)' }}
            title="Refresh Users from Google Sheet"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          ഗൂഗിൾ ഷീറ്റിലെ <strong>Users</strong> ടാബിലുള്ള നമ്പറുകൾ ഉപയോഗിച്ച് ആപ്പിലേക്ക് ലോഗിൻ ചെയ്യാം. പുതിയ നമ്പറുകൾ ഇവിടെ ആഡ് ചെയ്യുകയോ ഗൂഗിൾ ഷീറ്റിൽ നേരിട്ട് ചേർക്കുകയോ ചെയ്യാം.
        </p>

        {/* Add / Edit User Form */}
        <form onSubmit={handleUserSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>Mobile Number *</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. 9876543210"
                value={userPhone} 
                onChange={(e) => setUserPhone(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>User / Staff Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Rahul / Admin"
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>Role</label>
              <select 
                className="form-input"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Salesman">Salesman</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>Status</label>
              <select 
                className="form-input"
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value)}
              >
                <option value="Active">Active (അനുവദിച്ചത്)</option>
                <option value="Inactive">Inactive (ബ്ലോക്ക്)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>Photo URL (Drive Link)</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="Google Drive / Image link"
                value={userPhoto} 
                onChange={(e) => setUserPhoto(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '10px 16px' }}
                disabled={userSubmitting}
              >
                {userSubmitting ? 'Saving...' : (editingUserRow ? 'Update' : '+ Add Number')}
              </button>
              {editingUserRow && (
                <button 
                  type="button" 
                  onClick={cancelEditUser} 
                  className="btn" 
                  style={{ background: 'var(--danger)', padding: '10px 12px' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {userFeedback && (
            <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: userFeedback.startsWith('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: userFeedback.startsWith('✅') ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>
              {userFeedback}
            </div>
          )}
        </form>

        {/* Existing Users Table */}
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            📋 നിലവിലുള്ള നമ്പറുകൾ (Authorized Numbers):
          </h4>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading authorized users...</p>
          ) : (
            <div className="table-container" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Mobile Number</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => {
                    const photoImgUrl = formatDriveImageUrl(u.data[4] || '');
                    return (
                      <tr key={idx}>
                        <td>
                          {photoImgUrl ? (
                            <img
                              src={photoImgUrl}
                              alt={u.data[1] || 'User'}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-primary)' }}
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {(u.data[1] || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{u.data[0]}</td>
                        <td>{u.data[1] || '-'}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: u.data[2] === 'Admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: u.data[2] === 'Admin' ? 'var(--accent-primary)' : 'var(--text-primary)'
                          }}>
                            {u.data[2] || 'Staff'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: String(u.data[3]).toLowerCase() === 'inactive' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: String(u.data[3]).toLowerCase() === 'inactive' ? 'var(--danger)' : 'var(--success)'
                          }}>
                            {u.data[3] || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditUserClick(u)} className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Edit</button>
                            <button onClick={() => handleDeleteUser(u.rowNumber)} className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--danger)' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No authorized numbers found. Add a number above or in the Google Sheet 'Users' tab.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Month Data Management / Bulk Delete */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <h3 style={{ color: 'var(--danger)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🗑️ Delete Monthly Entries
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          Select a month below to bulk delete sales, collections, or expenses data.
        </p>

        <form onSubmit={handleDeleteMonthData}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>Select Month</label>
              <input 
                type="month" 
                className="form-input" 
                value={deleteMonth} 
                onChange={(e) => setDeleteMonth(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600' }}>What to Delete</label>
              <select 
                className="form-input" 
                value={deleteType} 
                onChange={(e) => setDeleteType(e.target.value)}
              >
                <option value="all">🔴 All (Sales, Collections & Expenses)</option>
                <option value="sales">🛒 Sales Only</option>
                <option value="collections">💰 Due Collections Only</option>
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
