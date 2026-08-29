import React, { useState, useEffect } from 'react';
import { getShops, getProducts, addShop, editShop, deleteShop, addProduct, editProduct, deleteProduct } from '../services/api';

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

  return (
    <div>
      <h1>Settings / Master Data</h1>
      
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
