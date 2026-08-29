import React, { useState, useEffect } from 'react';
import { getSales, getShops } from '../services/api';

const Ledger = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateLedger();
  }, []);

  const calculateLedger = async () => {
    setLoading(true);
    const [salesData, shopsData] = await Promise.all([getSales(), getShops()]);
    
    let validSales = [];
    if (salesData && salesData.length > 0) {
      const firstCell = String(salesData[0][0]).toLowerCase();
      if (firstCell === 'date' || firstCell === 'തീയതി') validSales = salesData.slice(1);
      else validSales = salesData;
    }

    let validShops = [];
    if (shopsData && shopsData.length > 0) {
      const firstCell = String(shopsData[0][0]).toLowerCase();
      if (firstCell.includes('shop')) validShops = shopsData.slice(1);
      else validShops = shopsData;
    }

    // Map to hold calculated totals per shop
    const shopTotals = {};

    // Initialize with all master shops so even those with 0 sales show up
    validShops.forEach(shopRow => {
      const shopName = shopRow[0];
      if (shopName) {
        shopTotals[shopName] = { totalSale: 0, totalReceived: 0 };
      }
    });

    // Calculate from sales
    // Assuming Sales structure: [Date, Shop, Item, Qty, Price, Sale By, Cash Received]
    validSales.forEach(row => {
      const shopName = row[1];
      const price = Number(row[4]) || 0;
      const cashReceived = Number(row[6]) || 0;
      
      if (shopName) {
        if (!shopTotals[shopName]) {
          shopTotals[shopName] = { totalSale: 0, totalReceived: 0 };
        }
        shopTotals[shopName].totalSale += price;
        shopTotals[shopName].totalReceived += cashReceived;
      }
    });

    // Format for display
    const calculatedLedger = Object.keys(shopTotals).map(shopName => {
      const totalSale = shopTotals[shopName].totalSale;
      const totalReceived = shopTotals[shopName].totalReceived;
      const outstanding = totalSale - totalReceived;
      return [shopName, totalSale, totalReceived, outstanding];
    });

    setLedger(calculatedLedger);
    setLoading(false);
  };

  return (
    <div>
      <h1>Ledger</h1>
      
      <div className="card">
        <h3>Outstanding Balances</h3>
        {loading ? <p>Loading and calculating data...</p> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Total Sale (₹)</th>
                  <th>Total Received (₹)</th>
                  <th>Outstanding Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row[0]}</td>
                    <td>₹{row[1]}</td>
                    <td>₹{row[2]}</td>
                    <td>
                      <span className={`badge ${Number(row[3]) > 0 ? 'badge-danger' : 'badge-success'}`}>
                        ₹{row[3]}
                      </span>
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center'}}>No ledger data found.</td>
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

export default Ledger;
