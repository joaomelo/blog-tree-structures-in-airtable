// where everything starts
byId('run').onclick = () => {
  byId('logs').innerHTML = '';
  run();
}

// helper functions
function byId(id) {
  return document.getElementById(id);
}

function addLog(text) {
  const p = document.createElement('p');
  p.innerText = text;
  byId('logs').appendChild(p);
}

// start of business code
function run() {
  const apiKey = byId('key').value;
  const baseId = byId('base').value;
  const tableName = byId('table').value;

  const Airtable = require('airtable');
  const table = new Airtable({ apiKey })
    .base(baseId)
    .table(tableName);

  loadRecords(table)
    .then(records => {
      const n = records.length;
      addLog(`loaded ${n} record(s) from ${tableName}`);
    })  
}

function loadRecords(table) {
  const allRecords = [];
  return table
    .select() // creates the query
    .eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(r => allRecords.push(r));
      fetchNextPage();
    }) // apply callback to all table
    .then(() => allRecords);
}