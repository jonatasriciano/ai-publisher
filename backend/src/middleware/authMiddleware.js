import jwt from 'jsonwebtoken';

// Middleware to authenticate JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer'

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
      }

      req.user = decoded; // Attach decoded user info to request object
      next();
    });
  } else {
    return res.status(401).json({ message: 'Authorization token is missing.' });
  }
};

export default authMiddleware;