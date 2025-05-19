const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const dataPath = path.join(dataDir, 'visits.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]));

function getAllVisits() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveAllVisits(visits) {
  fs.writeFileSync(dataPath, JSON.stringify(visits, null, 2));
}

module.exports = {
  getAllVisits,
  saveAllVisits,
  dataPath
};
