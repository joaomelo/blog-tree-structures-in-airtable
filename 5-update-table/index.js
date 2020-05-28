// helper functions
const byId = id => document.getElementById(id);

function addLog(text) {
  const p = document.createElement('p');
  p.innerText = text;
  byId('logs').appendChild(p);
}

// where everything happens
byId('run').onclick = () => {
  byId('logs').innerHTML = '';
  run();
}

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
      return updatePaths(table, records);
    })
    .then(() => addLog('paths updated'));
}

function loadRecords(table) {
  const allRecords = [];
  return table
    .select() // creates the query
    .eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(r => allRecords.push(r));
      fetchNextPage();
    }) // apply each page to all table
    .then(() => allRecords);
}

function calcPath(record, records) {
  const findParent = child => child.fields.parent
    ? records.find(record => record.id === child.fields.parent[0])
    : null;

  let path = record.fields.name;
  let parent = findParent(record);

  while (parent) {
    path = parent.fields.name + '/' + path;
    parent = findParent(parent);
  }

  return path;
}

function updatePaths(table, records) {
  const updatePromises = [];
  records.forEach(record => {
    const newPath = calcPath(record, records);

    if (record.fields.path !== newPath) {
      const promise = updateRecord(table, record.id, { path: newPath });
      updatePromises.push(promise);
    }
  });

  return Promise.all(updatePromises);
}

let last;
function updateRecord(table, id, entries) {
  const interval = 200;
  const now = Date.now();
  const passed = last ? now - last : interval;
  const timeout = interval - passed;  
  
  const updatePromise = new Promise(resolve => 
    setTimeout(
      () => resolve(table.update(id, entries)),
      timeout
    )
  );

  last = now + timeout;  
  return updatePromise;
};
