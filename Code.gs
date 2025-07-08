const SPREADSHEET_ID = '1qYVdV65Uun2YhsJKU7Cy79lKcUYD3I_oAGd7G5tQs6A';
const DOCS_FOLDER_ID = '1JnSYQu0o1NvEerJyWPS1pdm7aWgGSx_C';

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
  const idCol = headers.indexOf('id');
  if (idCol !== -1 && row.id === undefined) {
    const lastRow = sheet.getLastRow();
    const lastId = sheet.getRange(lastRow, idCol + 1).getValue();
    row.id = (Number(lastId) || 0) + 1;
  }
  const values = headers.map(h => row[h] || '');
  sheet.appendRow(values);
  return { success: true, id: row.id };
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
  const headers = data.shift();
  const emailIdx = headers.indexOf('email');
  const senhaIdx = headers.indexOf('senha');
  if (emailIdx === -1 || senhaIdx === -1) {
    throw new Error('Sheet "user" must have columns "email" and "senha"');
  }
  const ok = data.some(row => row[emailIdx] == email && row[senhaIdx] == senha);
  return { success: ok };
}

function updateRow(sheetName, id, row) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  if (idCol === -1) throw new Error('Sheet must contain id column');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      headers.forEach((h, idx) => {
        if (row.hasOwnProperty(h)) {
          sheet.getRange(i + 1, idx + 1).setValue(row[h]);
        }
      });
      return { success: true };
    }
  }
  throw new Error('ID not found');
}

function deleteRow(sheetName, id) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  if (idCol === -1) throw new Error('Sheet must contain id column');
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  throw new Error('ID not found');
}

function get_financeiro_summary() {
  const rows = getRows('fin');
  const sum = rows.reduce((acc, r) => {
    const v = Number(r.valor) || 0;
    if (r.status_pg === 'Pago') acc.total_realizado += v;
    if (r.tipo === 'Pagar') acc.total_despesas += v;
    if (r.tipo === 'Receber' && r.status_pg !== 'Pago') acc.a_receber += v;
    return acc;
  }, { total_realizado: 0, total_despesas: 0, a_receber: 0 });
  return [sum];
}

function get_relatorio_financeiro() {
  const rows = getRows('fin');
  const map = {};
  rows.forEach(r => {
    if (!r.data) return;
    const mes = Utilities.formatDate(new Date(r.data), Session.getScriptTimeZone(), 'yyyy-MM');
    if (!map[mes]) map[mes] = { mes, receitas: 0, despesas: 0 };
    const v = Number(r.valor) || 0;
    if (r.tipo === 'Receber') map[mes].receitas += v;
    if (r.tipo === 'Pagar') map[mes].despesas += v;
  });
  return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes));
}
