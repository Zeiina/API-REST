const request = require('supertest');
const app = require('../app');

describe("GET /api/articles", () => {

    test("Retourne un tableau", async () => {
        const res = await request(app).get('/api/articles');
        expect(Array.isArray(res.body)).toBe(true);
    });

});
