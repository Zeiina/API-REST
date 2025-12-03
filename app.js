const express = require('express');
const app = express();

app.use(express.json());

// Import routes
const articleRoutes = require('./routes/articleRoutes');
app.use('/articles', articleRoutes);

app.listen(3000, () => {
    console.log("Serveur lancé sur le port 3000 🚀");
});
