const crypto = require('crypto');
const { createId, readCollection, writeCollection } = require('./store');

const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
};

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    createdBy: user.createdBy || null,
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = String(storedHash || '').split(':');
  if (!salt || !originalHash) return false;

  const hashBuffer = Buffer.from(originalHash, 'hex');
  const candidateBuffer = crypto.scryptSync(password, salt, 64);

  if (hashBuffer.length !== candidateBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, candidateBuffer);
}

function ensureDefaultAdmin() {
  const users = readCollection('users');
  const existingAdmin = users.find((user) => user.role === ROLES.ADMIN);

  if (existingAdmin) {
    return sanitizeUser(existingAdmin);
  }

  const username = normalizeUsername(process.env.ADMIN_DEFAULT_USERNAME || 'admin');
  const password = String(process.env.ADMIN_DEFAULT_PASSWORD || 'admin123');
  const adminUser = {
    id: createId('user'),
    name: 'System Administrator',
    username,
    passwordHash: hashPassword(password),
    role: ROLES.ADMIN,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  };

  users.push(adminUser);
  writeCollection('users', users);
  return sanitizeUser(adminUser);
}

function createUser({ name, username, password, role, createdBy }) {
  const trimmedName = String(name || '').trim();
  const normalizedUsername = normalizeUsername(username);
  const trimmedPassword = String(password || '').trim();

  if (!trimmedName || !normalizedUsername || !trimmedPassword || !role) {
    throw new Error('Name, username, password, and role are required.');
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new Error('Invalid role provided.');
  }

  const users = readCollection('users');
  if (users.some((user) => user.username === normalizedUsername)) {
    throw new Error('Username already exists.');
  }

  const user = {
    id: createId('user'),
    name: trimmedName,
    username: normalizedUsername,
    passwordHash: hashPassword(trimmedPassword),
    role,
    createdAt: new Date().toISOString(),
    createdBy,
  };

  users.push(user);
  writeCollection('users', users);

  return sanitizeUser(user);
}

function updateUser({ userId, name, username, role }) {
  const trimmedName = String(name || '').trim();
  const normalizedUsername = normalizeUsername(username);

  if (!trimmedName || !normalizedUsername || !role) {
    throw new Error('Name, username, and role are required.');
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new Error('Invalid role provided.');
  }

  const users = readCollection('users');
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex < 0) {
    throw new Error('User not found.');
  }

  if (users.some((user) => user.id !== userId && user.username === normalizedUsername)) {
    throw new Error('Username already exists.');
  }

  const adminCount = users.filter((user) => user.role === ROLES.ADMIN).length;
  if (users[userIndex].role === ROLES.ADMIN && role !== ROLES.ADMIN && adminCount === 1) {
    throw new Error('At least one administrator account must remain in the system.');
  }

  users[userIndex] = {
    ...users[userIndex],
    name: trimmedName,
    username: normalizedUsername,
    role,
  };

  writeCollection('users', users);
  return sanitizeUser(users[userIndex]);
}

function updateUserPassword({ userId, password }) {
  const trimmedPassword = String(password || '').trim();
  if (!trimmedPassword) {
    throw new Error('Password is required.');
  }

  const users = readCollection('users');
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex < 0) {
    throw new Error('User not found.');
  }

  users[userIndex] = {
    ...users[userIndex],
    passwordHash: hashPassword(trimmedPassword),
  };

  writeCollection('users', users);
  return sanitizeUser(users[userIndex]);
}

function revokeUserSessions(userId) {
  const sessions = readCollection('sessions');
  const nextSessions = sessions.filter((session) => session.userId !== userId);
  writeCollection('sessions', nextSessions);
}

function deleteUser(userId) {
  const users = readCollection('users');
  const user = users.find((item) => item.id === userId);

  if (!user) {
    throw new Error('User not found.');
  }

  const adminCount = users.filter((item) => item.role === ROLES.ADMIN).length;
  if (user.role === ROLES.ADMIN && adminCount === 1) {
    throw new Error('At least one administrator account must remain in the system.');
  }

  writeCollection(
    'users',
    users.filter((item) => item.id !== userId)
  );
  revokeUserSessions(userId);
  return sanitizeUser(user);
}

function createSession(userId) {
  const sessions = readCollection('sessions');
  const session = {
    token: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
  };

  sessions.push(session);
  writeCollection('sessions', sessions);
  return session.token;
}

function removeSession(token) {
  const sessions = readCollection('sessions');
  const nextSessions = sessions.filter((session) => session.token !== token);
  writeCollection('sessions', nextSessions);
}

function getUserFromToken(token) {
  if (!token) return null;

  const sessions = readCollection('sessions');
  const session = sessions.find((item) => item.token === token);
  if (!session) return null;

  const users = readCollection('users');
  const user = users.find((item) => item.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

function loginUser(username, password) {
  const normalizedUsername = normalizeUsername(username);
  const users = readCollection('users');
  const user = users.find((item) => item.username === normalizedUsername);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid username or password.');
  }

  const token = createSession(user.id);
  return {
    token,
    user: sanitizeUser(user),
  };
}

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function authenticate(req, res, next) {
  const token = extractToken(req);
  const user = getUserFromToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  req.user = user;
  req.authToken = token;
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }

    next();
  };
}

module.exports = {
  ROLES,
  authenticate,
  createUser,
  deleteUser,
  ensureDefaultAdmin,
  hashPassword,
  loginUser,
  normalizeUsername,
  removeSession,
  requireRoles,
  revokeUserSessions,
  sanitizeUser,
  updateUser,
  updateUserPassword,
};