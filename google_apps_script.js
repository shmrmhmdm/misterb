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

  return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Unknown action"})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;

  if (action === "getSales") {
    var data = sheet.getSheetByName("Sales").getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "getLedger") {
    var data = sheet.getSheetByName("Ledger").getDataRange().getValues();
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
