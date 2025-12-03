# Projet API REST
Développement d'une API REST avec CRUD complet.
# 📚 Documentation Complète - Articles Manager API

## 📖 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Authentification JWT](#authentification-jwt)
6. [Endpoints API](#endpoints-api)
7. [Exemples d'utilisation](#exemples-dutilisation)
8. [Tests](#tests)
9. [Frontend](#frontend)
10. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

**Articles Manager API** est une API REST complète pour gérer des articles avec authentification JWT. Elle offre les fonctionnalités suivantes :

- ✅ **Authentification** : Register / Login avec JWT
- ✅ **CRUD** : Create, Read, Update, Delete articles
- ✅ **Sécurité** : Routes protégées par token Bearer
- ✅ **Tests** : Suite Jest + Supertest (43 tests)
- ✅ **Documentation** : OpenAPI/Swagger + Frontend moderne

**Stack technique :**
- Backend : Node.js + Express
- Auth : JWT (jsonwebtoken) + bcryptjs
- Tests : Jest + Supertest
- Frontend : HTML5 + CSS + JavaScript vanilla
- Documentation : OpenAPI 3.0.3

---

## 🏗️ Architecture

```
api-rest/
├── controllers/
│   ├── authController.js       (Register / Login)
│   └── articleController.js    (CRUD articles)
├── routes/
│   ├── authRoutes.js           (GET /auth/*)
│   └── articleRoutes.js        (GET /api/v1/articles)
├── middleware/
│   ├── auth.js                 (Vérification JWT Bearer)
│   ├── asyncHandler.js         (Try-catch wrapper)
│   └── errorHandler.js         (Gestion erreurs globales)
├── public/
│   └── index.html              (Frontend moderne)
├── openapi/
│   └── openapi.yaml            (Documentation OpenAPI)
├── test/
│   ├── articles.test.js        (Tests CRUD + Auth)
│   ├── getArticles.test.js     (Tests GET)
│   └── auth.test.js            (Tests d'authentification)
├── app.js                      (Express app)
├── server.js                   (HTTP server)
└── package.json
```

---

## 🚀 Installation

### Prérequis
- Node.js v14+
- npm v6+
- Windows PowerShell (ou terminal Unix)

### Étapes

1. **Cloner/créer le dossier du projet**
```powershell
cd "C:\Users\traor\Documents\controle continu\api rest"
```

2. **Installer les dépendances**
```powershell
npm install
```

3. **Démarrer le serveur**
```powershell
node server.js
# Résultat attendu : "Server running on http://localhost:3000"
```

4. **Accéder à l'application**
- Frontend : http://localhost:3000/
- Swagger UI : http://localhost:3000/api-docs (si monté)

---

## ⚙️ Configuration

### Variables d'environnement (.env)
Crée un fichier `.env` à la racine :

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_change_in_prod
JWT_EXPIRES_IN=1h
```

### Fichier package.json
```json
{
  "name": "api-rest",
  "version": "1.0.0",
  "description": "Articles Manager API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

---

## 🔐 Authentification JWT

### Flow d'authentification

```
1. Register (POST /auth/register)
   ↓
   Utilisateur créé + password hashé (bcryptjs)
   ↓
2. Login (POST /auth/login)
   ↓
   JWT signé (valide 1h par défaut)
   ↓
3. Requête protégée (POST /api/v1/articles)
   ↓
   Authorization: Bearer <JWT>
   ↓
   Middleware auth.js vérifie le token
   ↓
   ✓ Token valide → Opération autorisée
   ✗ Token manquant/invalide → 401 Unauthorized
```

### Exemple de token JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjEiLCJ1c2VybmFtZSI6Im1vbnVzZXIiLCJpYXQiOjE3MDEwODc2MDAsImV4cCI6MTcwMTA5MTIwMH0.
abcdef123456...
```

**Structure** :
- **Header** : {"alg":"HS256","typ":"JWT"}
- **Payload** : {"id":"1","username":"monuser","iat":..,"exp":..}
- **Signature** : HMAC-SHA256(header.payload, secret)

---

## 📡 Endpoints API

### Auth

#### 1. POST /auth/register
**Description** : Créer un nouvel utilisateur

**Request** :
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "username":"monuser", "password":"monpass" }'
```

**Response (201)** :
```json
{
  "id": "1",
  "username": "monuser"
}
```

**Errors** :
- 400 : username/password manquant
- 409 : Utilisateur déjà existant

---

#### 2. POST /auth/login
**Description** : S'authentifier et recevoir un JWT

**Request** :
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "username":"monuser", "password":"monpass" }'
```

**Response (200)** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors** :
- 400 : username/password manquant
- 401 : Identifiants invalides

---

### Articles

#### 3. GET /api/v1/articles
**Description** : Récupérer tous les articles (pas d'auth requise)

**Request** :
```bash
curl -X GET http://localhost:3000/api/v1/articles
```

**Response (200)** :
```json
{
  "articles": [
    {
      "id": "1",
      "title": "Titre",
      "content": "Contenu",
      "createdAt": "2025-12-03T10:00:00.000Z"
    }
  ]
}
```

---

#### 4. POST /api/v1/articles
**Description** : Créer un article (protégé)

**Request** :
```bash
curl -X POST http://localhost:3000/api/v1/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "title":"Mon article", "content":"Contenu détaillé" }'
```

**Response (201)** :
```json
{
  "article": {
    "id": "2",
    "title": "Mon article",
    "content": "Contenu détaillé",
    "createdAt": "2025-12-03T11:00:00.000Z"
  }
}
```

**Errors** :
- 400 : title manquant/vide
- 401 : Token manquant/invalide

---

#### 5. PUT /api/v1/articles/:id
**Description** : Mettre à jour un article (protégé)

**Request** :
```bash
curl -X PUT http://localhost:3000/api/v1/articles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "title":"Titre modifié" }'
```

**Response (200)** :
```json
{
  "article": {
    "id": "1",
    "title": "Titre modifié",
    "content": "Contenu",
    "updatedAt": "2025-12-03T12:00:00.000Z"
  }
}
```

**Errors** :
- 400 : Données invalides
- 401 : Token manquant/invalide
- 404 : Article non trouvé

---

#### 6. DELETE /api/v1/articles/:id
**Description** : Supprimer un article (protégé)

**Request** :
```bash
curl -X DELETE http://localhost:3000/api/v1/articles/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (204)** : No Content (corps vide)

**Errors** :
- 401 : Token manquant/invalide
- 404 : Article non trouvé

---

## 📝 Exemples d'utilisation

### Exemple complet : Register → Login → Create Article → Update → Delete

#### PowerShell

```powershell
# 1. Register
$body = '{ "username":"alice","password":"secret123" }'
Invoke-RestMethod -Uri 'http://localhost:3000/auth/register' -Method Post -ContentType 'application/json' -Body $body

# 2. Login
$resp = Invoke-RestMethod -Uri 'http://localhost:3000/auth/login' -Method Post -ContentType 'application/json' -Body $body
$token = $resp.token
$token  # Affiche le token

# 3. Create Article
$articleBody = '{ "title":"Mon premier article", "content":"Bonjour le monde!" }'
$createRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/articles' -Method Post `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType 'application/json' `
  -Body $articleBody
$articleId = $createRes.article.id

# 4. Update Article
$updateBody = '{ "title":"Mon article modifié" }'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/articles/$articleId" -Method Put `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType 'application/json' `
  -Body $updateBody

# 5. Get All Articles
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/articles' -Method Get

# 6. Delete Article
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/articles/$articleId" -Method Delete `
  -Headers @{ Authorization = "Bearer $token" }
```

#### Frontend (Browser)

1. Ouvre http://localhost:3000/
2. Clique sur **"Créer user + login"**
3. Remplis username et password, puis clique
4. Remplis titre + contenu dans le formulaire
5. Clique **"Créer l'article"**
6. Clique **"✏️ Éditer"** ou **"🗑️ Supprimer"** sur l'article

---

## 🧪 Tests

### Lancer tous les tests

```powershell
cd "C:\Users\traor\Documents\controle continu\api rest"
npm test
```

**Résultat attendu** :
```
PASS test/articles.test.js
PASS test/getArticles.test.js
Test Suites: 2 passed, 2 total
Tests: 38 passed, 38 total
```

### Couverture des tests

| Suite | Tests | Couverture |
|-------|-------|-----------|
| **articles.test.js** | 38 tests | Create, Read, Update, Delete + Auth |
| **getArticles.test.js** | 5 tests | GET /api/v1/articles |

### Exemples de tests

```javascript
// Test : Create article avec token valide → 201
test('POST /articles avec token valide => 201', async () => {
  const res = await request(app)
    .post('/api/v1/articles')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Another Article', content: 'Another Content' });
  expect(res.status).toBe(201);
  expect(res.body.article.title).toBe('Another Article');
});

// Test : Delete sans token → 401
test('DELETE /articles/:id sans token => 401', async () => {
  const res = await request(app)
    .delete(`/api/v1/articles/${articleId}`);
  expect(res.status).toBe(401);
});
```

---

## 🎨 Frontend

### Structure

**Localisation** : c:\Users\traor\Documents\controle continu\api rest\public\index.html

### Fonctionnalités

1. **Authentification**
   - Register / Login intégré
   - Bouton "Créer user + login" (automatisé)
   - Logout
   - Token persisté en localStorage

2. **CRUD Articles**
   - Créer article (formulaire)
   - Afficher liste complète
   - Éditer article (prompt modal)
   - Supprimer article (confirmation)

3. **UX Moderne**
   - Design gradient (violet)
   - Icônes et couleurs intuitives
   - Logs en temps réel
   - Responsive (mobile-friendly)

### Utilisation

Ouvre le navigateur :
```
http://localhost:3000/
```

---

## 🔧 Dépannage

### Erreur : "Server not running" (Cannot connect)

**Solution** :
```powershell
# Vérifier que le serveur tourne
Get-Process -Name node

# Démarrer le serveur
cd "C:\Users\traor\Documents\controle continu\api rest"
node server.js
```

### Erreur : "Token missing" (401) sur POST/PUT/DELETE

**Solutions** :
1. Vérifier que tu es connecté (token présent dans localStorage)
2. Vérifier le format du header : `Authorization: Bearer <token>` (espace important)
3. Vérifier que le token n'a pas expiré (1h par défaut)

### Erreur : "Invalid credentials" lors du login

**Solutions** :
1. Vérifier que l'utilisateur existe (Register d'abord)
2. Vérifier l'orthographe du username/password
3. Vérifier que le serveur a redémarré après les modifications

### Erreur : "Title is required" (400) lors de la création

**Solutions** :
1. Remplir obligatoirement le champ titre
2. Ne pas laisser le titre vide ou avec seulement des espaces

### Reset de la base de données (développement)

Pour réinitialiser tous les utilisateurs et articles :

```javascript
// Dans le fichier test ou contrôleur
authController.resetUsers();
articleController.resetArticles();
```

Ou redémarrer le serveur (données stockées en mémoire).

---

## 📊 Documentation OpenAPI

**Accès** : http://localhost:3000/api-docs (si Swagger UI est monté)

**Fichier** : c:\Users\traor\Documents\controle continu\api rest\openapi\openapi.yaml

Le fichier contient :
- ✓ Tous les endpoints
- ✓ Schémas des requêtes/réponses
- ✓ Codes d'erreur
- ✓ Exemples
- ✓ Security schemes (Bearer JWT)

---

## 🚢 Déploiement (Production)

### Changements avant le déploiement

1. **Variables d'environnement** :
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=generate-strong-secret-key-here
JWT_EXPIRES_IN=1h
```

2. **Sécurité** :
- Activer HTTPS
- Ajouter CORS si frontend séparé
- Utiliser une vraie base de données (MongoDB, PostgreSQL)
- Valider/sanitizer toutes les entrées

3. **Dépendances de production** :
```powershell
npm install --only=production
```

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier la console du serveur (logs)
2. Consulter les tests (test/)
3. Relire la documentation OpenAPI
4. Vérifier middleware/errorHandler.js pour la gestion d'erreur globale

---

## 📄 Licence

MIT License — Libre d'utilisation

**Auteur** : Projet Controle Continu

---

## 🎓 Ressources apprises

- ✅ REST API design
- ✅ JWT authentication
- ✅ Password hashing (bcryptjs)
- ✅ Error handling middleware
- ✅ Unit testing (Jest + Supertest)
- ✅ OpenAPI documentation
- ✅ Frontend vanilla JavaScript

Bonne lecture madame ! 