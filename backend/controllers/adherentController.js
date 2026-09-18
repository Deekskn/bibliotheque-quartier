const pool = require('../config/database');
const AppError = require('../utils/AppError');

async function getAllAdherents(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM adherents ORDER BY nom, prenom');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getAdherentById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM adherents WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return next(new AppError('Adhérent introuvable.', 404));
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/adherents/:id/emprunts -> historique des emprunts (en cours + passés)
async function getHistoriqueEmprunts(req, res, next) {
  try {
    const { id } = req.params;

    const adherent = await pool.query('SELECT id FROM adherents WHERE id = $1', [id]);
    if (adherent.rows.length === 0) {
      return next(new AppError('Adhérent introuvable.', 404));
    }

    const result = await pool.query(
      `SELECT e.id, e.date_emprunt, e.date_retour_prevue, e.date_retour_effective,
              l.id AS livre_id, l.titre,
              CASE
                WHEN e.date_retour_effective IS NOT NULL THEN 'rendu'
                WHEN e.date_retour_prevue < CURRENT_DATE THEN 'en_retard'
                ELSE 'en_cours'
              END AS statut
       FROM emprunts e
       JOIN livres l ON l.id = e.livre_id
       WHERE e.adherent_id = $1
       ORDER BY e.date_emprunt DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createAdherent(req, res, next) {
  try {
    const { nom, prenom, contact } = req.body;
    const result = await pool.query(
      'INSERT INTO adherents (nom, prenom, contact) VALUES ($1, $2, $3) RETURNING *',
      [nom, prenom, contact]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateAdherent(req, res, next) {
  try {
    const { id } = req.params;
    const { nom, prenom, contact } = req.body;
    const result = await pool.query(
      'UPDATE adherents SET nom = $1, prenom = $2, contact = $3 WHERE id = $4 RETURNING *',
      [nom, prenom, contact, id]
    );
    if (result.rows.length === 0) {
      return next(new AppError('Adhérent introuvable.', 404));
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteAdherent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM adherents WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return next(new AppError('Adhérent introuvable.', 404));
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === '23503') {
      return next(new AppError('Impossible de supprimer : cet adhérent a des emprunts associés.', 409));
    }
    next(err);
  }
}

module.exports = {
  getAllAdherents,
  getAdherentById,
  getHistoriqueEmprunts,
  createAdherent,
  updateAdherent,
  deleteAdherent,
};