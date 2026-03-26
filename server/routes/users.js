const express = require('express');
const {
  ROLES,
  authenticate,
  createUser,
  deleteUser,
  requireRoles,
  updateUser,
  updateUserPassword,
} = require('../lib/auth');
const { readCollection } = require('../lib/store');

const router = express.Router();

router.use(authenticate, requireRoles(ROLES.ADMIN));

router.get('/', (req, res) => {
  const users = readCollection('users').map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    createdBy: user.createdBy || null,
  }));

  res.json({ users });
});

router.post('/', (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const user = createUser({
      name,
      username,
      password,
      role,
      createdBy: req.user.id,
    });

    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to create user.' });
  }
});

router.put('/:userId', (req, res) => {
  try {
    const user = updateUser({
      userId: req.params.userId,
      name: req.body.name,
      username: req.body.username,
      role: req.body.role,
    });

    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to update user.' });
  }
});

router.put('/:userId/password', (req, res) => {
  try {
    const user = updateUserPassword({
      userId: req.params.userId,
      password: req.body.password,
    });

    res.json({ user, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to update password.' });
  }
});

router.delete('/:userId', (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own active account.' });
    }

    const user = deleteUser(req.params.userId);
    res.json({ user, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to delete user.' });
  }
});

module.exports = router;