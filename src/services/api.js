const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyK5i44uY8i66ZBzIupEBNiAhAPsOo4g9HrLAoXHEmUGoHFUzqvehr12BenRl1X0SqP/exec';

export const addSale = async (data) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addSale', data }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error adding sale:', error);
    throw error;
  }
};

export const editSale = async (rowIndex, data) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'editSale', rowIndex, data }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error editing sale:', error);
    throw error;
  }
};

export const deleteSale = async (rowIndex) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteSale', rowIndex }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
};

export const deleteMonthData = async (month, type = 'all') => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteMonthData', month, type }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error deleting month data:', error);
    throw error;
  }
};

export const addExpense = async (data) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addExpense', data }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const editExpense = async (rowIndex, data) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'editExpense', rowIndex, data }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error editing expense:', error);
    throw error;
  }
};

export const deleteExpense = async (rowIndex) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteExpense', rowIndex }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const addShop = async (data) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addShop', data }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error adding shop:', error);
    throw error;
  }
};

export const editShop = async (rowIndex, data) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'editShop', rowIndex, data }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error editing shop:', error);
    throw error;
  }
};

export const deleteShop = async (rowIndex) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteShop', rowIndex }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error deleting shop:', error);
    throw error;
  }
};

export const addProduct = async (data) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addProduct', data }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const editProduct = async (rowIndex, data) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'editProduct', rowIndex, data }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error editing product:', error);
    throw error;
  }
};

export const deleteProduct = async (rowIndex) => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteProduct', rowIndex }),
    });
    return { status: 'success' };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const getSales = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getSales&t=${new Date().getTime()}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
};

export const getLedger = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getLedger&t=${new Date().getTime()}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching ledger:', error);
    return [];
  }
};

export const getShops = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getShops&t=${new Date().getTime()}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching shops:', error);
    return [];
  }
};

export const getProducts = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getProducts&t=${new Date().getTime()}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getExpenses = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getExpenses&t=${new Date().getTime()}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};
