import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Verifies the JWT and attaches req.user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Restricts a route to a specific role.
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

// Students may only access their own data; teachers may access anyone's.
export function requireSelfOrTeacher(paramName = 'id') {
  return (req, res, next) => {
    const targetId = req.params[paramName];
    if (req.user.role === 'teacher' || req.user.id === targetId) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: you can only access your own data' });
  };
}
