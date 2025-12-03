// ...existing code...
const express = require('express');
const app = express();
const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes'); // si tu as auth
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());
app.use(express.static('public')); // sert public/index.html sur /

app.use('/auth', authRoutes);      // si tu as routes d'auth
app.use('/api', articleRoutes);
app.use('/api/v1', articleRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
app.use(errorHandler);

module.exports = app;
// ...existing code...