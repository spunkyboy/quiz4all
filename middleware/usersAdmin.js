// Admin middleware
const isAdminProtected = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user info' });
    }
  
    if (req.user.role !== 'admin') {
      console.warn('Blocked non-admin:', req.user);
      return res.status(403).json({ message: 'Admin access only' });
    }
  
    next();
  };
  
  module.exports = isAdminProtected;
  
  
  