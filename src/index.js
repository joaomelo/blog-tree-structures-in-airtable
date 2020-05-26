import "regenerator-runtime/runtime.js";
import Airtable from 'airtable';
import Bottleneck from 'bottleneck';
import './index.css'

const run = document.getElementById('run');
run.onclick = () => {
  const apiKey = document.getElementById('key').value;
  const baseId = document.getElementById('base').value;
  const tableName = document.getElementById('table').value;

  const table = createTable({ apiKey, baseId, tableName });
  const loadPromise = loadRecords(table);

  const logs = document.getElementById('logs');
  logs.innerHTML = '';
  const addLog = text => {
    const p = document.createElement('p');
    p.innerText = text;
    logs.appendChild(p);
  }

  loadPromise
    .then(records => {
      addLog(`loaded ${records.length} record(s) from ${tableName}`);
      return updatePaths(table, records);
    })
    .then(() => addLog('updated paths'));
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

function calcPath(record, records) {
  const findParent = child => child.fields.parent
    ? records.find(record => record.id === child.fields.parent[0])
    : null

  let path = record.fields.name;
  let parent = findParent(record)

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

const MAX_REQUESTS_PER_SECOND = 5;
const SECOND = 1000;
const limiter = new Bottleneck({
  minTime: SECOND / MAX_REQUESTS_PER_SECOND
});

function updateRecord(table, id, entries) {
  return limiter.schedule(() => table.update(id, entries));
};
