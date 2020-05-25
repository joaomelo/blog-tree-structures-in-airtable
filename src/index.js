import Airtable from 'airtable';
import './index.css'

const run = document.getElementById('run');
run.onclick = () => {
  const apiKey = document.getElementById('key').value;
  const baseId = document.getElementById('base').value;
  const tableName = document.getElementById('table').value;

  const table = createTable({ apiKey, baseId, tableName });
  const loadPromise = loadRecords(table);

  loadPromise.then(records => {
    const logs = document.getElementById('logs');
    logs.innerHTML = `loaded ${records.length} record(s) from ${tableName}`;
  })
}

function createTable({apiKey, baseId, tableName}) {
  return new Airtable({ apiKey })
    .base(baseId)
    .table(tableName)
}

function loadRecords(table) {
  const allRecords = [];
  return table
    .select()
    .eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(r => allRecords.push(r));
      fetchNextPage();
    })
    .then(() => allRecords);
}