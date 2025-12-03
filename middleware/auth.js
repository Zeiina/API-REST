// ...existing code...
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'change_me_for_prod';

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    const err = new Error('Token missing');
    err.status = 401;
    return next(err);
  }
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch (e) {
    e.status = 401;
    next(e);
  }
};
// ...existing code...