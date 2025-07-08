const SPREADSHEET_ID = 'PASTE_SPREADSHEET_ID';
const DOCS_FOLDER_ID = 'PASTE_DRIVE_FOLDER_ID';

function getSheet_(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function getRows(sheetName) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => headers.reduce((o, h, i) => (o[h] = row[i], o), {}));
}

function addRow(sheetName, row) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getDataRange().getValues()[0];
  const values = headers.map(h => row[h] || '');
  sheet.appendRow(values);
  return { success: true };
}

function uploadDocument(name, base64) {
  const folder = DriveApp.getFolderById(DOCS_FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), undefined, name);
  const file = folder.createFile(blob);
  return { id: file.getId(), name: file.getName(), url: file.getUrl() };
}
