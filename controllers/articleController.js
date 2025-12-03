// ...existing code...
// stockage en mémoire (déclaré en haut du module)
let articles = [];
let nextId = 1;

function validateArticlePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    const err = new Error('Invalid payload');
    err.status = 400;
    throw err;
  }
  const { title, content } = payload;
  if (typeof title !== 'string' || title.trim() === '') {
    const err = new Error('title is required and must be a non-empty string');
    err.status = 400;
    throw err;
  }
  if (content !== undefined && typeof content !== 'string') {
    const err = new Error('content must be a string when provided');
    err.status = 400;
    throw err;
  }
  return { title: title.trim(), content: content === undefined ? '' : content };
}

exports.createArticle = async (req, res) => {
  const { title, content } = validateArticlePayload(req.body);
  const article = {
    id: String(nextId++),
    title,
    content,
    createdAt: new Date().toISOString()
  };
  articles.push(article);
  res.status(201).json({ article });
};

exports.getAllArticles = async (req, res) => {
  // compatibilité tests: /api => tableau brut, /api/v1 => { articles: [...] }
  if (req.baseUrl === '/api') return res.json(articles);
  return res.json({ articles });
};

exports.updateArticle = async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};

  if ('title' in payload) {
    if (typeof payload.title !== 'string' || payload.title.trim() === '') {
      const err = new Error('title must be a non-empty string when provided');
      err.status = 400;
      throw err;
    }
    payload.title = payload.title.trim();
  }
  if ('content' in payload && typeof payload.content !== 'string') {
    const err = new Error('content must be a string when provided');
    err.status = 400;
    throw err;
  }

  const idx = articles.findIndex(a => a.id === id);
  if (idx === -1) {
    const err = new Error('Article not found');
    err.status = 404;
    throw err;
  }

  const updated = { ...articles[idx], ...payload, updatedAt: new Date().toISOString() };
  articles[idx] = updated;
  res.json({ article: updated });
};

exports.deleteArticle = async (req, res) => {
  const { id } = req.params;
  const idx = articles.findIndex(a => a.id === id);
  if (idx === -1) {
    const err = new Error('Article not found');
    err.status = 404;
    throw err;
  }
  articles.splice(idx, 1);
  res.status(204).send();
};

exports.resetArticles = () => {
  articles = [];
  nextId = 1;
};
// ...existing code...