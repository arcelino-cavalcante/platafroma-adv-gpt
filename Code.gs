const SPREADSHEET_ID = '1qYVdV65Uun2YhsJKU7Cy79lKcUYD3I_oAGd7G5tQs6A';
const DOCS_FOLDER_ID = '1JnSYQu0o1NvEerJyWPS1pdm7aWgGSx_C';

function getSheet_(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function getRows(sheetName) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const rawHeaders = data.shift();
  // Normaliza cabeçalhos para letras minúsculas
  const headers = rawHeaders.map(h => String(h).toLowerCase());
  return data.map(row => headers.reduce((o, h, i) => (o[h] = row[i], o), {}));
}

function addRow(sheetName, row) {
  const sheet = getSheet_(sheetName);
  const rawHeaders = sheet.getDataRange().getValues()[0];
  const headers = rawHeaders.map(h => String(h).toLowerCase());

  // Converte as chaves do objeto recebido para letras minúsculas
  const lowerRow = Object.keys(row).reduce((acc, k) => {
    acc[String(k).toLowerCase()] = row[k];
    return acc;
  }, {});

  // Atribui um ID incremental se a planilha possuir a coluna "id" e o valor
  // ainda não tiver sido definido no objeto recebido.
  const idIdx = headers.indexOf('id');
  if (idIdx > -1 && !lowerRow.id) {
    // getLastRow retorna o número da última linha com dados. Como a primeira
    // linha contém os cabeçalhos, o próximo ID corresponde a lastRow.
    lowerRow.id = sheet.getLastRow();
  }

  const values = headers.map(h => lowerRow[h] || '');
  sheet.appendRow(values);
  return { success: true };
}

function uploadDocument(name, base64) {
  const folder = DriveApp.getFolderById(DOCS_FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), undefined, name);
  const file = folder.createFile(blob);
  return { id: file.getId(), name: file.getName(), url: file.getUrl() };
}

function login(email, senha) {
  const sheet = getSheet_('user');
  const data = sheet.getDataRange().getValues();
  const rawHeaders = data.shift();
  const headers = rawHeaders.map(h => String(h).toLowerCase());
  const emailIdx = headers.indexOf('email');
  const senhaIdx = headers.indexOf('senha');
  if (emailIdx === -1 || senhaIdx === -1) {
    throw new Error('Sheet "user" must have columns "email" and "senha"');
  }
  const ok = data.some(row => row[emailIdx] == email && row[senhaIdx] == senha);
  return { success: ok };
}
