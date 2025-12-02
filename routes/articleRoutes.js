const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Routes CRUD (Zeinab fait Create + Read)
router.post('/', articleController.createArticle);
router.get('/', articleController.getAllArticles);

module.exports = router;
