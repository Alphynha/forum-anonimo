const express = require('express');
const router = express.Router();
const db = require('../database/init');

router.get('/', (req, res) => {
    try {
        const artigos = db.prepare('SELECT * FROM artigos ORDER BY id DESC').all();
        res.json({ success: true, count: artigos.length, data: artigos });
    } catch (error) {
        /* istanbul ignore next */
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
        /* istanbul ignore next */
        console.error('[POST] /artigos:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao criar artigo' });
    }
});

// DELETE /api/artigos/:id — remove um artigo pelo id
router.delete('/:id', (req, res) => {
    // req.params.id captura o valor dinâmico da URL
    // Ex: DELETE /api/artigos/5 → req.params.id = "5"
    const { id } = req.params;

    try {
        // Verifica se o artigo existe antes de tentar remover
        const artigo = db.prepare('SELECT id FROM artigos WHERE id = ?').get(id);

        if (!artigo) {
            // 404 = Not Found — artigo não existe
            return res.status(404).json({
                success: false,
                message: 'Artigo não encontrado.'
            });
        }

        // Remove o artigo
        db.prepare('DELETE FROM artigos WHERE id = ?').run(id);

        // 204 = No Content — removido com sucesso, sem corpo na resposta
        res.status(204).send();

        /* istanbul ignore next */
    } catch (err) {
        /* istanbul ignore next */
        console.error('[DELETE /artigos]', err.message);
        res.status(500).json({ success: false, message: 'Erro ao remover artigo.' });
    }
});

module.exports = router;