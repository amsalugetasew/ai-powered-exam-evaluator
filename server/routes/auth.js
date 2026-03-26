const express = require('express');
const {
  authenticate,
  ensureDefaultAdmin,
  loginUser,
  removeSession,
} = require('../lib/auth');

const router = express.Router();

ensureDefaultAdmin();

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const result = loginUser(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message || 'Login failed.' });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', authenticate, (req, res) => {
  removeSession(req.authToken);
  res.json({ success: true });
});

module.exports = router;