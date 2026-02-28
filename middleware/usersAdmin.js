// Admin middleware
const isAdminProtected = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Unauthorized: No user info (did auth middleware run?)' 
      });
    }

    if (req.user.role !== 'admin') {
      console.warn(`Blocked non-admin user: ${req.user.id || 'unknown'}`);
      return res.status(403).json({ 
        message: 'Forbidden: Admin access only' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
  
  module.exports = isAdminProtected;
  
  
  