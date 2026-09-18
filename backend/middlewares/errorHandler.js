// backend/middlewares/errorHandler.js

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Erreur interne du serveur';

  if (!err.isOperational) {
    // Erreur non prévue (bug) : on log la stack complète côté serveur
    console.error(err);
  }

  res.status(statusCode).json({
    statut: 'erreur',
    message,
  });
}

module.exports = errorHandler;