const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./accounts.db', (err) => {
  if (err) {
    console.error('Database connection failed: ' + err.message);
  } else {
    console.log('Connected to the accounts database.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    status TEXT NOT NULL
  )`);
});

const addAccount = (account, callback) => {
  const { id, name, password, status } = account;
  db.run(`INSERT INTO accounts (id, name, password, status) VALUES (?, ?, ?, ?)`, [id, name, password, status], callback);
};

const getAccounts = (callback) => {
  db.all(`SELECT * FROM accounts`, [], (err, rows) => {
    callback(err, rows);
  });
};

const updateAccount = (account, callback) => {
  const { id, name, password, status } = account;
  db.run(`UPDATE accounts SET name = ?, password = ?, status = ? WHERE id = ?`, [name, password, status, id], callback);
};

const deleteAccount = (id, callback) => {
  db.run(`DELETE FROM accounts WHERE id = ?`, [id], callback);
};

module.exports = {
  addAccount,
  getAccounts,
  updateAccount,
  deleteAccount
};
