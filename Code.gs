const SPREADSHEET_ID = '1qYVdV65Uun2YhsJKU7Cy79lKcUYD3I_oAGd7G5tQs6A';
const DOCS_FOLDER_ID = '1JnSYQu0o1NvEerJyWPS1pdm7aWgGSx_C';

function getSheet_(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    const lowerName = name.toLowerCase();
    sheet = ss.getSheets().find(s => s.getName().toLowerCase().trim() === lowerName);
  }
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function getRows(sheetName) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const rawHeaders = data.shift();
  // Normaliza cabeçalhos para letras minúsculas
  const headers = rawHeaders.map(h => String(h).toLowerCase());
  const rows = data.map(r => {
    const obj = {};
    headers.forEach((h, i) => {
      let v = r[i];
      if (v instanceof Date) {
        v = Utilities.formatDate(v, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
      }
      obj[h] = v;
    });
    return obj;
  });

  // Sincroniza a aba de documentos com a pasta no Drive
  if (sheetName === 'docs') {
    const existingIds = rows.map(r => String(r.file_id));
    const folder = DriveApp.getFolderById(DOCS_FOLDER_ID);
    const files = folder.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      const id = f.getId();
      if (existingIds.indexOf(id) === -1) {
        const newRow = {
          id: sheet.getLastRow(),
          cliente_id: '',
          caso_id: '',
          titulo: f.getName(),
          file_id: id,
          file_nome: f.getName(),
          file_url: f.getUrl(),
        };
        const values = headers.map(h => newRow[h] || '');
        sheet.appendRow(values);
        rows.push(newRow);
      }
    }
    SpreadsheetApp.flush();
  }

  return rows;
}

function deleteRow(sheetName, id) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const rawHeaders = data.shift();
  const headers = rawHeaders.map(h => String(h).toLowerCase());
  const idIdx = headers.indexOf('id');
  if (idIdx === -1) throw new Error('Sheet must have an id column');
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][idIdx]) == String(id)) {
      sheet.deleteRow(i + 2); // +2 porque cabeçalho ocupa a primeira linha
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false, message: 'ID not found' };
}

function updateRow(sheetName, id, row) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const rawHeaders = data.shift();
  const headers = rawHeaders.map(h => String(h).toLowerCase());
  const idIdx = headers.indexOf('id');
  if (idIdx === -1) throw new Error('Sheet must have an id column');
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][idIdx]) == String(id)) {
      const rowNum = i + 2;
      const existing = sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
      headers.forEach((h, j) => {
        if (h in row) existing[j] = row[h];
      });
      sheet.getRange(rowNum, 1, 1, headers.length).setValues([existing]);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false, message: 'ID not found' };
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
  SpreadsheetApp.flush();
  return { success: true };
}

function uploadDocument(name, base64) {
  const folder = DriveApp.getFolderById(DOCS_FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), undefined, name);
  const file = folder.createFile(blob);
  SpreadsheetApp.flush();
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
