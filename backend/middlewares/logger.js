// backend/middlewares/logger.js

function logger(req, res, next) {
    const debut = Date.now();
    res.on('finish', () => {
        const duree = Date.now() - debut;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duree}ms)`);
  });
  next();
}

module.exports = logger;