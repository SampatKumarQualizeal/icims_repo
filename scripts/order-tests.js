// Usage: node scripts/order-tests.js > ordered-files.txt

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const testDir = path.join(process.cwd(), 'tests');
const files = glob.sync('**/*.spec.ts', { cwd: testDir }).map(f => path.join(testDir, f));

function priorityOf(content) {
  const m = content.match(/@priority\s+(\d+)/);
  return m ? Number(m[1]) : 50; // default medium
}

const fileObjs = files.map(f => {
  const content = fs.readFileSync(f, 'utf8');
  return { path: f, priority: priorityOf(content) };
});

fileObjs.sort((a,b) => a.priority - b.priority || a.path.localeCompare(b.path));

for (const f of fileObjs) console.log(f.path);
