const request = require('supertest');
const app = require('../server');
const db = require('../src/database/init');

// ─────────────────────────────────────────────────────────────────────────────
// SETUP E TEARDOWN
// Antes de cada teste, limpamos a tabela para garantir que os testes
// são independentes entre si — o resultado de um não afeta o outro.
// ─────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
    db.prepare('DELETE FROM artigos').run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name='artigos'").run();
});

// Fecha a conexão com o banco após todos os testes terminarem
afterAll(() => {
    db.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — cria um artigo diretamente no banco para uso nos testes
// ─────────────────────────────────────────────────────────────────────────────
function criarArtigo(titulo = 'Título de teste', conteudo = 'Conteúdo de teste válido') {
    return db.prepare('INSERT INTO artigos (titulo, conteudo) VALUES (?, ?)').run(titulo, conteudo);
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTES — GET /api/artigos
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/artigos', () => {

    test('deve retornar lista vazia quando não há artigos', async () => {
        const res = await request(app).get('/api/artigos');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(0);
    });

    test('deve retornar lista com artigos existentes', async () => {
        criarArtigo('Primeiro artigo', 'Conteúdo do primeiro artigo');
        criarArtigo('Segundo artigo', 'Conteúdo do segundo artigo');

        const res = await request(app).get('/api/artigos');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(2);
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// TESTES — POST /api/artigos
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/artigos', () => {

    test('deve criar um artigo com dados válidos', async () => {
        const res = await request(app)
            .post('/api/artigos')
            .send({ titulo: 'Meu artigo', conteudo: 'Conteúdo válido do artigo.' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.titulo).toBe('Meu artigo');
    });

    test('deve retornar 400 quando título está ausente', async () => {
        const res = await request(app)
            .post('/api/artigos')
            .send({ conteudo: 'Conteúdo sem título' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('deve retornar 400 quando título tem menos de 3 caracteres', async () => {
        const res = await request(app)
            .post('/api/artigos')
            .send({ titulo: 'ab', conteudo: 'Conteúdo válido do artigo.' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('deve retornar 400 quando conteúdo está ausente', async () => {
        const res = await request(app)
            .post('/api/artigos')
            .send({ titulo: 'Título válido' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('deve retornar 400 quando conteúdo tem menos de 10 caracteres', async () => {
        const res = await request(app)
            .post('/api/artigos')
            .send({ titulo: 'Título válido', conteudo: 'curto' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// TESTES — DELETE /api/artigos/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/artigos/:id', () => {

    test('deve remover um artigo existente e retornar 204', async () => {
        const result = criarArtigo();
        const id = result.lastInsertRowid;

        const res = await request(app).delete(`/api/artigos/${id}`);
        expect(res.status).toBe(204);
    });

    test('deve retornar 404 quando artigo não existe', async () => {
        const res = await request(app).delete('/api/artigos/999');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// TESTES — GET /health
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /health', () => {

    test('deve retornar status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// TESTES — Rota não encontrada
// ─────────────────────────────────────────────────────────────────────────────
describe('Rota não encontrada', () => {

    test('deve retornar 404 para rota inexistente', async () => {
        const res = await request(app).get('/rota-que-nao-existe');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

});