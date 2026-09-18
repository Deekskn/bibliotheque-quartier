// backend/controllers/authorController.js

const pool = require('../config/database');
const AppError = require('../utils/AppError');


async function getAllAuteurs(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM auteurs ORDER BY nom, prenom');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}


async function getAuteurById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM auteurs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return next(new AppError('Auteur introuvable.', 404));
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}


async function createAuteur(req, res, next) {
  try {
    const { nom, prenom, nationalite } = req.body;
    const result = await pool.query(
      'INSERT INTO auteurs (nom, prenom, nationalite) VALUES ($1, $2, $3) RETURNING *',
      [nom, prenom, nationalite || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}


async function updateAuteur(req, res, next) {
  try {
    const { id } = req.params;
    const { nom, prenom, nationalite } = req.body;
    const result = await pool.query(
      'UPDATE auteurs SET nom = $1, prenom = $2, nationalite = $3 WHERE id = $4 RETURNING *',
      [nom, prenom, nationalite || null, id]
    );
    if (result.rows.length === 0) {
      return next(new AppError('Auteur introuvable.', 404));
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}


async function deleteAuteur(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM auteurs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return next(new AppError('Auteur introuvable.', 404));
    }
    res.status(204).send();
  } catch (err) {
    // Si l'auteur a encore des livres liés (contrainte de clé étrangère)
    if (err.code === '23503') {
      return next(new AppError('Impossible de supprimer : cet auteur a des livres associés.', 409));
    }
    next(err);
  }
}

module.exports = {
  getAllAuteurs,
  getAuteurById,
  createAuteur,
  updateAuteur,
  deleteAuteur,
};