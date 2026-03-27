const express = require('express');
const router = express.Router();
const db = require('../database/init');

router.get('/', (req, res) => {
    try {
        const artigos = db.prepare('SELECT * FROM artigos ORDER BY id DESC').all();
        res.json({ success: true, count: artigos.length, data: artigos });
    } catch (error) {
        console.error('[GET] /artigos:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao buscar artigos' });
    }
});

router.post('/', (req, res) => {
    const { titulo, conteudo } = req.body;

    if (!titulo || titulo.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: 'Título deve ter pelo menos 3 caracteres'
        })
    }

    if (!conteudo || conteudo.trim().length < 10) {
        return res.status(400).json({
            success: false,
            message: 'Conteúdo deve ter pelo menos 10 caracteres'
        })
    }

    try {
        const stmt = db.prepare('INSERT INTO artigos (titulo, conteudo) VALUES (?, ?)');
        const result = stmt.run(titulo.trim(), conteudo.trim());
        const novo = db.prepare('SELECT * FROM artigos WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, data: novo });
    } catch (error) {
        console.error('[POST] /artigos:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao criar artigo' });
    }
});

module.exports = router;