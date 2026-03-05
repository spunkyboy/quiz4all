const jwtGuest = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      req.user = null;
      return next();
    }
  
    try {
      const decoded = jwtGuest.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId || decoded.id || decoded._id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (err) {
      console.warn('Invalid token for optional auth:', err.message);
      req.user = null; // treat as guest
    }
  
    next();
  };

  module.exports = optionalAuth;