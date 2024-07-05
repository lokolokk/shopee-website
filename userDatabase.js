const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // default user for MySQL in XAMPP
  password: '',  // default password for MySQL in XAMPP
  database: 'user_management'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

const addUser = (user, callback) => {
  const { username, password, expiration } = user;
  const query = 'INSERT INTO users (username, password, expiration) VALUES (?, ?, ?)';
  db.query(query, [username, password, expiration], callback);
};

const getUser = (username, password, callback) => {
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    callback(err, results[0]);
  });
};

const getUserById = (id, callback) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    callback(err, results[0]);
  });
};

module.exports = {
  addUser,
  getUser,
  getUserById
};
