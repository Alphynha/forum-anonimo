const express = require('express');
const path = require('path');
const db = require('./src/database/init');
const artigosRouter = require('./src/routes/artigos');
const { timeStamp } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/artigos', artigosRouter);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: `${Math.floor(process.uptime())}s`,
        timeStamp: new Date().toISOString()
    });
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota não encontrada: ${req.method} ${req.path}`
    });
});

app.listen(PORT, () => {
    console.log('');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│         FÓRUM ANÔNIMO — BACKEND         │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│  Servidor:  http://localhost:${PORT}        │`);
    console.log(`│  API:       http://localhost:${PORT}/api/artigos │`);
    console.log(`│  Health:    http://localhost:${PORT}/health    │`);
    console.log('└─────────────────────────────────────────┘');
    console.log('');
});