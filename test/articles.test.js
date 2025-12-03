const request = require('supertest');
const app = require('../app');
const authController = require('../controllers/authController');
const articleController = require('../controllers/articleController');

beforeEach(() => {
  if (typeof authController.resetUsers === 'function') {
    authController.resetUsers();
  }
  if (typeof articleController.resetArticles === 'function') {
    articleController.resetArticles();
  }
});

describe('Authentication - JWT', () => {
  describe('POST /auth/register', () => {
    test('201 et retourne user créé', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username');
      expect(res.body.username).toBe('testuser');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    test('400 si username manquant', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ password: 'testpass' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/username/i);
    });

    test('400 si password manquant', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'testuser' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/password/i);
    });

    test('409 si user existe déjà', async () => {
      await request(app)
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'testuser', password: 'otherpass' });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
    });

    test('200 et retourne JWT token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(10);
    });

    test('400 si username manquant', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ password: 'testpass' });
      expect(res.status).toBe(400);
    });

    test('400 si password manquant', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser' });
      expect(res.status).toBe(400);
    });

    test('401 si username n\'existe pas', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'testpass' });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid credentials/i);
    });

    test('401 si password incorrect', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'wrongpass' });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid credentials/i);
    });

    test('token est valide JWT format', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
      const token = res.body.token;
      const parts = token.split('.');
      expect(parts.length).toBe(3);
    });
  });

  describe('Protected Routes - Article CREATE/UPDATE/DELETE with Auth', () => {
    let token;
    let articleId;

    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
      const loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
      token = loginRes.body.token;

      const createRes = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Article', content: 'Test Content' });
      articleId = createRes.body.article.id;
    });

    test('POST /articles sans token => 401', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .send({ title: 'Test', content: 'Test' });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/token missing/i);
    });

    test('POST /articles avec token invalide => 401', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', 'Bearer invalid_token')
        .send({ title: 'Test', content: 'Test' });
      expect(res.status).toBe(401);
    });

    test('POST /articles avec token valide => 201', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Another Article', content: 'Another Content' });
      expect(res.status).toBe(201);
      expect(res.body.article.title).toBe('Another Article');
    });

    test('PUT /articles/:id sans token => 401', async () => {
      const res = await request(app)
        .put(`/api/v1/articles/${articleId}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(401);
    });

    test('PUT /articles/:id avec token valide => 200', async () => {
      const res = await request(app)
        .put(`/api/v1/articles/${articleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.body.article.title).toBe('Updated Title');
    });

    test('DELETE /articles/:id sans token => 401', async () => {
      const res = await request(app)
        .delete(`/api/v1/articles/${articleId}`);
      expect(res.status).toBe(401);
    });

    test('DELETE /articles/:id avec token valide => 204', async () => {
      const res = await request(app)
        .delete(`/api/v1/articles/${articleId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    test('GET /articles accessible sans token', async () => {
      const res = await request(app)
        .get('/api/v1/articles');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('articles');
    });
  });

  describe('Token dans différents formats', () => {
    let token;

    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
      const loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
      token = loginRes.body.token;
    });

    test('401 si Authorization header manquant', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .send({ title: 'Test', content: 'Test' });
      expect(res.status).toBe(401);
    });

    test('401 si format Bearer mal formé', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer_${token}`)
        .send({ title: 'Test', content: 'Test' });
      expect(res.status).toBe(401);
    });

    test('401 si token fourni sans "Bearer"', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', token)
        .send({ title: 'Test', content: 'Test' });
      expect(res.status).toBe(401);
    });

    test('201 avec Authorization: Bearer TOKEN correct', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', content: 'Test' });
      expect(res.status).toBe(201);
    });
  });
});

describe('Articles API - CRUD Operations (avec token)', () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'testpass' });
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' });
    token = loginRes.body.token;
  });

  describe('POST /api/v1/articles (Create)', () => {
    test('201 et retourne article créé', async () => {
      const payload = { title: 'Mon titre', content: 'Mon contenu' };
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('article');
      expect(res.body.article.title).toBe('Mon titre');
      expect(res.body.article.content).toBe('Mon contenu');
      expect(res.body.article.id).toBeDefined();
      expect(res.body.article.createdAt).toBeDefined();
    });

    test('400 si title manquant', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'C' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('400 si title vide', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '   ' });
      expect(res.status).toBe(400);
    });

    test('400 si content non-string', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T', content: 123 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/articles (Read All)', () => {
    test('200 et retourne tableau vide', async () => {
      const res = await request(app).get('/api/v1/articles');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('articles');
      expect(Array.isArray(res.body.articles)).toBe(true);
      expect(res.body.articles.length).toBe(0);
    });

    test('200 et retourne articles créés', async () => {
      await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T1', content: 'C1' });
      await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T2', content: 'C2' });
      const res = await request(app).get('/api/v1/articles');
      expect(res.status).toBe(200);
      expect(res.body.articles.length).toBe(2);
      expect(res.body.articles[0].title).toBe('T1');
      expect(res.body.articles[1].title).toBe('T2');
    });
  });

  describe('PUT /api/v1/articles/:id (Update)', () => {
    test('200 et met à jour article', async () => {
      const create = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T', content: 'C' });
      const id = create.body.article.id;
      const res = await request(app)
        .put(`/api/v1/articles/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Nouveau titre', content: 'Nouveau contenu' });
      expect(res.status).toBe(200);
      expect(res.body.article.title).toBe('Nouveau titre');
      expect(res.body.article.content).toBe('Nouveau contenu');
      expect(res.body.article.updatedAt).toBeDefined();
    });

    test('404 si article n\'existe pas', async () => {
      const res = await request(app)
        .put('/api/v1/articles/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T' });
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });

    test('400 si titre vide', async () => {
      const create = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T', content: 'C' });
      const id = create.body.article.id;
      const res = await request(app)
        .put(`/api/v1/articles/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '   ' });
      expect(res.status).toBe(400);
    });

    test('200 et met à jour partiellement (title seulement)', async () => {
      const create = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T', content: 'C' });
      const id = create.body.article.id;
      const res = await request(app)
        .put(`/api/v1/articles/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Nouveau' });
      expect(res.status).toBe(200);
      expect(res.body.article.title).toBe('Nouveau');
      expect(res.body.article.content).toBe('C');
    });
  });

  describe('DELETE /api/v1/articles/:id (Delete)', () => {
    test('204 et supprime article', async () => {
      const create = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T', content: 'C' });
      const id = create.body.article.id;
      const res = await request(app)
        .delete(`/api/v1/articles/${id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);

      const getRes = await request(app).get('/api/v1/articles');
      expect(getRes.body.articles.length).toBe(0);
    });

    test('404 si article n\'existe pas', async () => {
      const res = await request(app)
        .delete('/api/v1/articles/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });

    test('204 et ne supprime que l\'article cible', async () => {
      const a1 = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T1', content: 'C1' });
      const a2 = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T2', content: 'C2' });
      const id1 = a1.body.article.id;

      await request(app)
        .delete(`/api/v1/articles/${id1}`)
        .set('Authorization', `Bearer ${token}`);

      const getRes = await request(app).get('/api/v1/articles');
      expect(getRes.body.articles.length).toBe(1);
      expect(getRes.body.articles[0].title).toBe('T2');
    });
  });

  describe('Cas limites & intégration', () => {
    test('workflow complet: Create -> Read -> Update -> Delete', async () => {
      const create = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T1', content: 'C1' });
      const id = create.body.article.id;
      expect(create.status).toBe(201);

      const getRes = await request(app).get('/api/v1/articles');
      expect(getRes.body.articles.length).toBe(1);

      const update = await request(app)
        .put(`/api/v1/articles/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'T1_updated' });
      expect(update.status).toBe(200);
      expect(update.body.article.title).toBe('T1_updated');

      const del = await request(app)
        .delete(`/api/v1/articles/${id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(del.status).toBe(204);

      const finalGet = await request(app).get('/api/v1/articles');
      expect(finalGet.body.articles.length).toBe(0);
    });

    test('trim whitespace sur title lors de create/update', async () => {
      const create = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '  Mon titre  ' });
      expect(create.body.article.title).toBe('Mon titre');

      const id = create.body.article.id;
      const update = await request(app)
        .put(`/api/v1/articles/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '  Nouveau  ' });
      expect(update.body.article.title).toBe('Nouveau');
    });
  });
});