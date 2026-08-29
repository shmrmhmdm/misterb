import React, { useState, useEffect } from 'react';
import { getExpenses, addExpense, editExpense, deleteExpense } from '../services/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    expenseType: '',
    description: '',
    amount: '',
    paymentMethod: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const data = await getExpenses();
    
    let parsedExpenses = [];
    if (data && data.length > 0) {
      const firstCell = String(data[0][0]).toLowerCase();
      const hasHeader = (firstCell === 'date' || firstCell === 'തീയതി');
      const startIndex = hasHeader ? 1 : 0;
      
      for (let i = startIndex; i < data.length; i++) {
        parsedExpenses.push({
          rowNumber: i + 1, // Google sheets is 1-indexed
          data: data[i]
        });
      }
    }
    
    setExpenses(parsedExpenses.reverse()); // Show newest first
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (expenseObj) => {
    let dateStr = expenseObj.data[0];
    if (dateStr && new Date(dateStr).toString() !== "Invalid Date") {
       const d = new Date(dateStr);
       dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    setFormData({
      date: dateStr || new Date().toISOString().split('T')[0],
      expenseType: expenseObj.data[1] || '',
      description: expenseObj.data[2] || '',
      amount: expenseObj.data[3] || '',
      paymentMethod: expenseObj.data[4] || ''
    });
    setEditingRow(expenseObj.rowNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData(initialFormState);
    setEditingRow(null);
  };

  const handleDeleteClick = async (rowIndex) => {
    if (window.confirm("Are you sure you want to delete this expense? This cannot be undone.")) {
      try {
        await deleteExpense(rowIndex);
        if (editingRow === rowIndex) cancelEdit();
        fetchExpenses();
      } catch (error) {
        alert("Error deleting expense");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRow) {
        await editExpense(editingRow, formData);
      } else {
        await addExpense(formData);
      }
      setFormData(initialFormState);
      setEditingRow(null);
      fetchExpenses();
    } catch (error) {
      alert(editingRow ? "Error updating expense" : "Error adding expense");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h1>Expenses Data</h1>
      
      <div className="card" style={{ marginBottom: '24px', border: editingRow ? '1px solid var(--primary)' : 'none' }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3>{editingRow ? 'Edit Expense' : 'Add New Expense'}</h3>
          {editingRow && <button type="button" onClick={cancelEdit} className="btn" style={{background:'var(--danger)'}}>Cancel Edit</button>}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Expense Type</label>
              <select name="expenseType" className="form-input" value={formData.expenseType} onChange={handleChange} required>
                <option value="">-- Select Type --</option>
                <option value="Fuel">Fuel</option>
                <option value="Food">Food</option>
                <option value="Salary">Salary</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <input type="text" name="description" className="form-input" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" name="amount" className="form-input" value={formData.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select name="paymentMethod" className="form-input" value={formData.paymentMethod} onChange={handleChange} required>
                <option value="">-- Select Method --</option>
                <option value="Cash">Cash</option>
                <option value="Bank/UPI">Bank/UPI</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '16px' }}>
            {submitting ? (editingRow ? 'Updating...' : 'Adding...') : (editingRow ? 'Update Expense' : 'Add Expense')}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Recent Expenses</h3>
        {loading ? <p>Loading data from Google Sheets...</p> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expenseObj, idx) => {
                  const row = expenseObj.data;
                  return (
                    <tr key={idx}>
                      <td>{new Date(row[0]).toLocaleDateString()}</td>
                      <td><span className="badge badge-warning">{row[1]}</span></td>
                      <td>{row[2]}</td>
                      <td><span className="badge badge-danger">₹{row[3]}</span></td>
                      <td>{row[4]}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditClick(expenseObj)} className="btn" style={{padding:'4px 8px', fontSize:'0.8rem'}}>Edit</button>
                          <button onClick={() => handleDeleteClick(expenseObj.rowNumber)} className="btn" style={{padding:'4px 8px', fontSize:'0.8rem', background: 'var(--danger)'}}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center'}}>No expenses data found</td>
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

export default Expenses;
