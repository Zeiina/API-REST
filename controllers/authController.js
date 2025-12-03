const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'change_me_for_prod';

let users = [];
let nextUserId = 1;

exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
    if (users.find(u => u.username === username)) return res.status(409).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: String(nextUserId++), username, passwordHash: hash };
    users.push(user);
    return res.status(201).json({ id: user.id, username: user.username });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) { next(err); }
};

exports.resetUsers = () => {
  users = [];
  nextUserId = 1;
};