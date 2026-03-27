const express = require('express');
const router = express.Router();
const db = require('../database/init');

router.get('/', (req, res) => {
    try {
        const artigos = db.prepare('SELECT * FROM posts ORDER BY id DESC').all();
        res.json({ success: true, count: artigos.length, data: artigos });
    } catch (error) {
        console.error('[GET] /artigos:', error.messsage);
        res.status(500).json({ success: false, error: 'Erro ao buscar artigos' });
    }
});

module.exports = router;