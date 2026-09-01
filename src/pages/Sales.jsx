import React, { useState, useEffect } from 'react';
import { getSales, addSale, editSale, deleteSale, getShops, getProducts } from '../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [shopsList, setShopsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [editingRow, setEditingRow] = useState(null); // stores Google Sheet row index
  
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    shop: '',
    item: '',
    qty: '',
    price: '',
    saleBy: '',
    cashReceived: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchSalesAndMasters();
  }, []);

  const fetchSalesAndMasters = async () => {
    setLoading(true);
    const [salesData, shopsData, productsData] = await Promise.all([
      getSales(), getShops(), getProducts()
    ]);
    
    // Process sales with row numbers for editing
    let parsedSales = [];
    if (salesData && salesData.length > 0) {
      const firstCell = String(salesData[0][0]).toLowerCase();
      const hasHeader = (firstCell === 'date' || firstCell === 'തീയതി');
      const startIndex = hasHeader ? 1 : 0;
      
      for (let i = startIndex; i < salesData.length; i++) {
         parsedSales.push({
            rowNumber: i + 1, // Google sheets is 1-indexed
            data: salesData[i]
         });
      }
    }
    setSales(parsedSales.reverse()); // show newest first

    // Process shops
    if (shopsData && shopsData.length > 0) {
      const firstCell = String(shopsData[0][0]).toLowerCase();
      if (firstCell.includes('shop')) setShopsList(shopsData.slice(1));
      else setShopsList(shopsData);
    } else setShopsList([]);

    // Process products
    if (productsData && productsData.length > 0) {
      const firstCell = String(productsData[0][0]).toLowerCase();
      if (firstCell.includes('item') || firstCell.includes('product')) setProductsList(productsData.slice(1));
      else setProductsList(productsData);
    } else setProductsList([]);
    
    setLoading(false);
  };

  const handleProductChange = (e) => {
    const itemName = e.target.value;
    const selectedProduct = productsList.find(p => p[0] === itemName);
    let autoPrice = formData.price;
    
    if (selectedProduct && formData.qty) {
       autoPrice = Number(selectedProduct[1]) * Number(formData.qty);
    }
    setFormData({ ...formData, item: itemName, price: autoPrice });
  };

  const handleQtyChange = (e) => {
    const qty = e.target.value;
    const selectedProduct = productsList.find(p => p[0] === formData.item);
    let autoPrice = formData.price;
    
    if (selectedProduct && qty) {
       autoPrice = Number(selectedProduct[1]) * Number(qty);
    }
    setFormData({ ...formData, qty: qty, price: autoPrice });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (saleObj) => {
    // Populate form with existing data
    let dateStr = saleObj.data[0];
    if (dateStr && new Date(dateStr).toString() !== "Invalid Date") {
       const d = new Date(dateStr);
       dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    
    setFormData({
      date: dateStr || new Date().toISOString().split('T')[0],
      shop: saleObj.data[1] || '',
      item: saleObj.data[2] || '',
      qty: saleObj.data[3] || '',
      price: saleObj.data[4] || '',
      saleBy: saleObj.data[5] || '',
      cashReceived: saleObj.data[6] || ''
    });
    setEditingRow(saleObj.rowNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData(initialFormState);
    setEditingRow(null);
  };

  const handleDeleteClick = async (rowIndex) => {
    if (window.confirm("Are you sure you want to delete this sale entry?")) {
      try {
        await deleteSale(rowIndex);
        if (editingRow === rowIndex) cancelEdit();
        fetchSalesAndMasters();
      } catch (error) {
        alert("Error deleting sale");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRow) {
        await editSale(editingRow, formData);
      } else {
        await addSale(formData);
      }
      setFormData(initialFormState);
      setEditingRow(null);
      fetchSalesAndMasters();
    } catch (error) {
      alert(editingRow ? "Error updating sale" : "Error adding sale");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h1>Sales Data</h1>
      
      <div className="card" style={{ marginBottom: '24px', border: editingRow ? '1px solid var(--primary)' : 'none' }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3>{editingRow ? 'Edit Sale' : 'Add New Sale'}</h3>
          {editingRow && <button type="button" onClick={cancelEdit} className="btn" style={{background:'var(--danger)'}}>Cancel Edit</button>}
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <select name="shop" className="form-input" value={formData.shop} onChange={handleChange} required>
                <option value="">-- Select Shop --</option>
                {shopsList.map((s, i) => (
                  <option key={i} value={s[0]}>{s[0]}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Item</label>
              <select name="item" className="form-input" value={formData.item} onChange={handleProductChange} required>
                <option value="">-- Select Item --</option>
                {productsList.map((p, i) => (
                  <option key={i} value={p[0]}>{p[0]} (₹{p[1]})</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input type="number" name="qty" className="form-input" value={formData.qty} onChange={handleQtyChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Total Price (₹)</label>
              <input type="number" name="price" className="form-input" value={formData.price} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Cash Received</label>
              <input type="number" name="cashReceived" className="form-input" value={formData.cashReceived} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Sale By</label>
              <input type="text" name="saleBy" className="form-input" value={formData.saleBy} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (editingRow ? 'Updating...' : 'Adding...') : (editingRow ? 'Update Sale' : 'Add Sale')}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Recent Sales</h3>
        {loading ? <p>Loading data from Google Sheets...</p> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shop</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Cash Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((saleObj, idx) => {
                  const row = saleObj.data;
                  return (
                    <tr key={idx}>
                      <td>{new Date(row[0]).toLocaleDateString()}</td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                      <td>{row[3]}</td>
                      <td><span className="badge badge-success">₹{row[4]}</span></td>
                      <td>₹{row[6]}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditClick(saleObj)} className="btn" style={{padding:'4px 8px', fontSize:'0.8rem'}}>Edit</button>
                          <button onClick={() => handleDeleteClick(saleObj.rowNumber)} className="btn" style={{padding:'4px 8px', fontSize:'0.8rem', background: 'var(--danger)'}}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center'}}>No sales data found</td>
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

export default Sales;
