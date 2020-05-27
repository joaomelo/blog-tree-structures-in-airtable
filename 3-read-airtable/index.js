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
  const config = {
    apiKey: byId('key').value,
    baseId: byId('base').value,
    tableName: byId('table').value
  }
  
  const table = createTable(config);
  const Airtable = require('airtable');
  return new Airtable({ apiKey })
    .base(baseId)
    .table(tableName)

}

loadRecords2(table)
  .then(records => {
    addLog(`loaded ${records.length} record(s)`);
  });


function loadRecords({ key, base, table }, offset = null, records = []) {
  const paramsStr = offset ? `?offset=${offset}` : '';

  const instance = axios.create({
    url: `https://api.airtable.com/v0/${base}/${table}${paramsStr}`,
    headers: {
      Authorization: `Bearer ${key}`
    },
  });
  
  return instance
    .get()
    .then(response => {
      const pageRecords = response.data.records;
      const pageOffset = response.data.offset;
      pageRecords.forEach(r => records.push(r));
      return pageOffset ? loadRecords({ key, base, table }, pageOffset, records) : records;
    })
}

function loadRecords2(table) {
  const allRecords = [];
  return table
    .select()
    .eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(r => allRecords.push(r));
      fetchNextPage();
    })
    .then(() => allRecords);
}