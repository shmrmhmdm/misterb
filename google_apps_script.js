function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var params = JSON.parse(e.postData.contents);
  var action = params.action;

  if (action === "addSale") {
    var salesSheet = sheet.getSheetByName("Sales");
    if(!salesSheet) {
      salesSheet = sheet.insertSheet("Sales");
      salesSheet.appendRow(["Date", "Shop", "Item", "Qty", "Price", "Sale By", "Cash Received"]);
    }
    salesSheet.appendRow([params.data.date, params.data.shop, params.data.item, params.data.qty, params.data.price, params.data.saleBy, params.data.cashReceived]);
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "editSale") {
    var salesSheet = sheet.getSheetByName("Sales");
    // rowIndex comes from frontend (1-based index)
    var rowIndex = params.rowIndex;
    if (salesSheet && rowIndex) {
      salesSheet.getRange(rowIndex, 1, 1, 7).setValues([[params.data.date, params.data.shop, params.data.item, params.data.qty, params.data.price, params.data.saleBy, params.data.cashReceived]]);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "addExpense") {
    var expenseSheet = sheet.getSheetByName("Expenses");
    if(!expenseSheet) {
      expenseSheet = sheet.insertSheet("Expenses");
      expenseSheet.appendRow(["Date", "Expense Type", "Description", "Amount", "Payment Method"]);
    }
    expenseSheet.appendRow([params.data.date, params.data.expenseType, params.data.description, params.data.amount, params.data.paymentMethod]);
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "editExpense") {
    var expenseSheet = sheet.getSheetByName("Expenses");
    var rowIndex = params.rowIndex;
    if (expenseSheet && rowIndex) {
      expenseSheet.getRange(rowIndex, 1, 1, 5).setValues([[params.data.date, params.data.expenseType, params.data.description, params.data.amount, params.data.paymentMethod]]);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteExpense") {
    var expenseSheet = sheet.getSheetByName("Expenses");
    var rowIndex = params.rowIndex;
    if (expenseSheet && rowIndex) {
      expenseSheet.deleteRow(rowIndex);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "addShop") {
    var shopsSheet = sheet.getSheetByName("Shops");
    if(!shopsSheet) {
      shopsSheet = sheet.insertSheet("Shops");
      shopsSheet.appendRow(["Shop Name", "Address/Phone"]);
    }
    shopsSheet.appendRow([params.data.shopName, params.data.details]);
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "editShop") {
    var shopsSheet = sheet.getSheetByName("Shops");
    var rowIndex = params.rowIndex;
    if (shopsSheet && rowIndex) {
      shopsSheet.getRange(rowIndex, 1, 1, 2).setValues([[params.data.shopName, params.data.details]]);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteShop") {
    var shopsSheet = sheet.getSheetByName("Shops");
    var rowIndex = params.rowIndex;
    if (shopsSheet && rowIndex) {
      shopsSheet.deleteRow(rowIndex);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addProduct") {
    var productsSheet = sheet.getSheetByName("Products");
    if(!productsSheet) {
      productsSheet = sheet.insertSheet("Products");
      productsSheet.appendRow(["Item Name", "Price"]);
    }
    productsSheet.appendRow([params.data.itemName, params.data.price]);
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "editProduct") {
    var productsSheet = sheet.getSheetByName("Products");
    var rowIndex = params.rowIndex;
    if (productsSheet && rowIndex) {
      productsSheet.getRange(rowIndex, 1, 1, 2).setValues([[params.data.itemName, params.data.price]]);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteProduct") {
    var productsSheet = sheet.getSheetByName("Products");
    var rowIndex = params.rowIndex;
    if (productsSheet && rowIndex) {
      productsSheet.deleteRow(rowIndex);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addCollection") {
    var collectionSheet = sheet.getSheetByName("Collections");
    if(!collectionSheet) {
      collectionSheet = sheet.insertSheet("Collections");
      collectionSheet.appendRow(["Date", "Shop", "Amount", "Payment Mode", "Collected By", "Notes"]);
    }
    collectionSheet.appendRow([params.data.date, params.data.shop, params.data.amount, params.data.paymentMode, params.data.collectedBy, params.data.notes]);
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "editCollection") {
    var collectionSheet = sheet.getSheetByName("Collections");
    var rowIndex = params.rowIndex;
    if (collectionSheet && rowIndex) {
      collectionSheet.getRange(rowIndex, 1, 1, 6).setValues([[params.data.date, params.data.shop, params.data.amount, params.data.paymentMode, params.data.collectedBy, params.data.notes]]);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteCollection") {
    var collectionSheet = sheet.getSheetByName("Collections");
    var rowIndex = params.rowIndex;
    if (collectionSheet && rowIndex) {
      collectionSheet.deleteRow(rowIndex);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteSale") {
    var salesSheet = sheet.getSheetByName("Sales");
    var rowIndex = params.rowIndex;
    if (salesSheet && rowIndex) {
      salesSheet.deleteRow(rowIndex);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteMonthData") {
    var targetMonth = params.month; // e.g. "2026-09"
    var targetType = params.type || "all"; // "all", "sales", "expenses", "collections"
    var deletedSalesCount = 0;
    var deletedExpensesCount = 0;
    var deletedCollectionsCount = 0;

    function isMatchMonth(cellValue, monthStr) {
      if (!cellValue) return false;
      var d = new Date(cellValue);
      if (isNaN(d.getTime())) return false;
      var yyyy = d.getFullYear();
      var mm = ("0" + (d.getMonth() + 1)).slice(-2);
      return (yyyy + "-" + mm) === monthStr;
    }

    if (targetType === "all" || targetType === "sales") {
      var salesSheet = sheet.getSheetByName("Sales");
      if (salesSheet) {
        var salesData = salesSheet.getDataRange().getValues();
        for (var i = salesData.length - 1; i >= 1; i--) {
          if (isMatchMonth(salesData[i][0], targetMonth)) {
            salesSheet.deleteRow(i + 1);
            deletedSalesCount++;
          }
        }
      }
    }

    if (targetType === "all" || targetType === "expenses") {
      var expenseSheet = sheet.getSheetByName("Expenses");
      if (expenseSheet) {
        var expenseData = expenseSheet.getDataRange().getValues();
        for (var j = expenseData.length - 1; j >= 1; j--) {
          if (isMatchMonth(expenseData[j][0], targetMonth)) {
            expenseSheet.deleteRow(j + 1);
            deletedExpensesCount++;
          }
        }
      }
    }

    if (targetType === "all" || targetType === "collections") {
      var collectionSheet = sheet.getSheetByName("Collections");
      if (collectionSheet) {
        var collData = collectionSheet.getDataRange().getValues();
        for (var k = collData.length - 1; k >= 1; k--) {
          if (isMatchMonth(collData[k][0], targetMonth)) {
            collectionSheet.deleteRow(k + 1);
            deletedCollectionsCount++;
          }
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      deletedSales: deletedSalesCount,
      deletedExpenses: deletedExpensesCount,
      deletedCollections: deletedCollectionsCount
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addUser") {
    var usersSheet = sheet.getSheetByName("Users");
    if (!usersSheet) {
      usersSheet = sheet.insertSheet("Users");
      usersSheet.appendRow(["Phone Number", "Name", "Role", "Status", "Photo URL"]);
    }
    usersSheet.appendRow([params.data.phone, params.data.name, params.data.role || "Staff", params.data.status || "Active", params.data.photo || ""]);
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "editUser") {
    var usersSheet = sheet.getSheetByName("Users");
    var rowIndex = params.rowIndex;
    if (usersSheet && rowIndex) {
      usersSheet.getRange(rowIndex, 1, 1, 5).setValues([[params.data.phone, params.data.name, params.data.role, params.data.status, params.data.photo || ""]]);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteUser") {
    var usersSheet = sheet.getSheetByName("Users");
    var rowIndex = params.rowIndex;
    if (usersSheet && rowIndex) {
      usersSheet.deleteRow(rowIndex);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Unknown action"})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;

  if (action === "getUsers" || action === "getAuth") {
    var usersSheet = sheet.getSheetByName("Users");
    if (!usersSheet) {
      usersSheet = sheet.insertSheet("Users");
      usersSheet.appendRow(["Phone Number", "Name", "Role", "Status", "Photo URL"]);
      usersSheet.appendRow(["9876543210", "Admin", "Admin", "Active", ""]);
    }
    var data = usersSheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getSales") {
    var salesSheet = sheet.getSheetByName("Sales");
    var data = salesSheet ? salesSheet.getDataRange().getValues() : [];
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getCollections") {
    var collectionSheet = sheet.getSheetByName("Collections");
    var data = collectionSheet ? collectionSheet.getDataRange().getValues() : [];
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "getLedger") {
    var ledgerSheet = sheet.getSheetByName("Ledger");
    var data = ledgerSheet ? ledgerSheet.getDataRange().getValues() : [];
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "getShops") {
    var shopsSheet = sheet.getSheetByName("Shops");
    var data = shopsSheet ? shopsSheet.getDataRange().getValues() : [];
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "getProducts") {
    var productsSheet = sheet.getSheetByName("Products");
    var data = productsSheet ? productsSheet.getDataRange().getValues() : [];
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "getExpenses") {
    var expenseSheet = sheet.getSheetByName("Expenses");
    var data = expenseSheet ? expenseSheet.getDataRange().getValues() : [];
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Unknown action"})).setMimeType(ContentService.MimeType.JSON);
}
