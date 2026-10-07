// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  // JWTs are sent in the Authorization header as: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer xyz" -> "xyz"

  try {
    // jwt.verify checks the signature against JWT_SECRET AND checks expiry —
    // throws an error if either check fails
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user id to the request so any route using this middleware
    // can access req.userId without re-verifying anything
    req.userId = decoded.userId;

    next(); // signals Express to move on to the actual route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;