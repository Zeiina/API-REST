const { articles } = require('../models/articleModel');
exports.createArticle = (req, res) => {
    const { title, content } = req.body;

    // Validation simple
    if (!title || !content) {
        return res.status(400).json({ message: "Titre et contenu obligatoires" });
    }

    const newArticle = {
        id: articles.length + 1,
        title,
        content
    };

    articles.push(newArticle);

    res.status(201).json(newArticle);
};
exports.getAllArticles = (req, res) => {
    res.json(articles);
};
