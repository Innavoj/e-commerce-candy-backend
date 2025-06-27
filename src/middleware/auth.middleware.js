const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  // Check if token is in Bearer format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token is not in Bearer format.' });
  }

  const token = parts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request object
    // The payload structure is { user: { id: '...', email: '...' } }
    req.user = decoded.user; 
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token is expired.' });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token is not valid.' });
    }
    res.status(401).json({ message: 'Token is not valid (unknown reason).' });
  }
};
