const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const DEFAULT_COLLECTIONS = {
  users: [],
  sessions: [],
  exams: [],
  submissions: [],
};

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getCollectionPath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function ensureCollectionFile(name) {
  ensureDataDirectory();
  const filePath = getCollectionPath(name);

  if (!fs.existsSync(filePath)) {
    const initialValue = DEFAULT_COLLECTIONS[name] ?? [];
    fs.writeFileSync(filePath, JSON.stringify(initialValue, null, 2));
  }

  return filePath;
}

function initializeDataFiles() {
  Object.keys(DEFAULT_COLLECTIONS).forEach(ensureCollectionFile);
}

function readCollection(name) {
  const filePath = ensureCollectionFile(name);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeCollection(name, value) {
  const filePath = ensureCollectionFile(name);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

module.exports = {
  createId,
  initializeDataFiles,
  readCollection,
  writeCollection,
};