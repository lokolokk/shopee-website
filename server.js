const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const dbAccounts = require('./database'); // SQLite for accounts
const dbUsers = require('./userDatabase'); // MySQL for users

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Route for handling login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  dbUsers.getUser(username, password, (err, user) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else if (user) {
      const now = new Date();
      const expiration = new Date(user.expiration);
      if (now < expiration) {
        res.cookie('user', user.id, { maxAge: 24 * 60 * 60 * 1000 }); // Set cookie for 1 day
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Access expired. Please contact support.' });
      }
    } else {
      res.json({ success: false, message: 'Invalid credentials.' });
    }
  });
});

// Middleware to protect routes
app.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/index.html' || req.path === '/admin' || req.path === '/api/accounts' || req.path === '/api/check-session') {
    return next();
  }
  const userId = req.cookies.user;
  dbUsers.getUserById(userId, (err, user) => {
    if (err || !user) {
      return res.redirect('/index.html');
    }
    const now = new Date();
    const expiration = new Date(user.expiration);
    if (now < expiration) {
      return next();
    } else {
      res.clearCookie('user'); // Clear the cookie
      res.redirect('/index.html?message=Access expired. Please log in again.'); // Redirect with message
    }
  });
});

// Serve the login page as index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the customer view page
app.get('/customer-view.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'customer-view.html'));
});

// Serve the admin view page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-view.html'));
});

// Endpoint to check session status
app.get('/api/check-session', (req, res) => {
  const userId = req.cookies.user;
  dbUsers.getUserById(userId, (err, user) => {
    if (err || !user) {
      return res.json({ valid: false });
    }
    const now = new Date();
    const expiration = new Date(user.expiration);
    if (now < expiration) {
      return res.json({ valid: true });
    } else {
      res.clearCookie('user'); // Clear the cookie
      return res.json({ valid: false });
    }
  });
});

// Account management API
app.get('/api/accounts', (req, res) => {
  dbAccounts.getAccounts((err, accounts) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(accounts);
    }
  });
});

app.post('/api/accounts', (req, res) => {
  const { name, password, status } = req.body;
  const newAccount = { id: uuidv4(), name, password, status };
  dbAccounts.addAccount(newAccount, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json(newAccount);
    }
  });
});

app.put('/api/accounts', (req, res) => {
  const { id, name, password, status } = req.body;
  const updatedAccount = { id, name, password, status };
  dbAccounts.updateAccount(updatedAccount, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(updatedAccount);
    }
  });
});

app.delete('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  dbAccounts.deleteAccount(id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(204).send();
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
