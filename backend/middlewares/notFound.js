// backend/middlewares/notFound.js
// Déclenché quand aucune route ne correspond à la requête.

const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(`Route introuvable : ${req.method} ${req.originalUrl}`, 404));
}

module.exports = notFound;