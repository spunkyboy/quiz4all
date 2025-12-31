const jwt = require('jsonwebtoken');

const authenToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // keep the full payload
    req.user = {
      userId: decoded.userId || decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role,
    };

    if (!req.user.userId) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

module.exports = authenToken;
