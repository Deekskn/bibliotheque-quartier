// backend/server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./config/database');
const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const authorsRouter = require('./routes/authors');
const adherentsRouter = require('./routes/adherents');
const livresRouter = require('./routes/livres');
const empruntsRouter = require('./routes/emprunts');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use('/api/auteurs', authorsRouter);
app.use('/api/adherents', adherentsRouter);
app.use('/api/livres', livresRouter);
app.use('/api/emprunts', empruntsRouter);
app.use('/api/stats', statsRouter);


app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS heure_serveur');
        res.json({ status: 'ok', heure_serveur: result.rows[0].heure_serveur });
    } catch (err) {
        console.error('Erreur lors de la vérification de la base de données :', err.message);
        res.status(500).json({ status: 'erreur', message: 'Connexion à la base de données impossible' });
    }
});

// --- Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});