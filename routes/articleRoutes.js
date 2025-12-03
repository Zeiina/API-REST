// ...existing code...
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const asyncHandler = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');

// CRUD endpoints (sans doublons)
router.route('/articles')
  .post(auth, asyncHandler(articleController.createArticle))
  .get(asyncHandler(articleController.getAllArticles));

router.route('/articles/:id')
  .put(auth, asyncHandler(articleController.updateArticle))
  .delete(auth, asyncHandler(articleController.deleteArticle));

module.exports = router;
// ...existing code...