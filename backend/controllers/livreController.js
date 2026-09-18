// backend/controllers/livreController.js

const pool = require('../config/database');
const AppError = require('../utils/AppError');

// GET /api/livres?search=&page=&limit=
// Liste des livres avec le nom de l'auteur, recherche par titre/auteur, pagination.
async function getAllLivres(req, res, next) {
  try {
    const search = (req.query.search || '').trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = (page - 1) * limit;

    const params = [];
    let whereClause = '';

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE l.titre ILIKE $${params.length}
                      OR a.nom ILIKE $${params.length}
                      OR a.prenom ILIKE $${params.length}`;
    }

    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM livres l JOIN auteurs a ON a.id = l.auteur_id ${whereClause}`,
      params
    );
    const total = parseInt(totalResult.rows[0].count, 10);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT l.id, l.titre, l.annee_publication, l.disponible,
              a.id AS auteur_id, a.nom AS auteur_nom, a.prenom AS auteur_prenom
       FROM livres l
       JOIN auteurs a ON a.id = l.auteur_id
       ${whereClause}
       ORDER BY l.titre
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      donnees: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getLivreById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT l.id, l.titre, l.annee_publication, l.disponible,
              a.id AS auteur_id, a.nom AS auteur_nom, a.prenom AS auteur_prenom
       FROM livres l
       JOIN auteurs a ON a.id = l.auteur_id
       WHERE l.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return next(new AppError('Livre introuvable.', 404));
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function createLivre(req, res, next) {
  try {
    const { titre, auteur_id, annee_publication } = req.body;

    const auteur = await pool.query('SELECT id FROM auteurs WHERE id = $1', [auteur_id]);
    if (auteur.rows.length === 0) {
      return next(new AppError('Auteur introuvable pour cet auteur_id.', 400));
    }

    const result = await pool.query(
      'INSERT INTO livres (titre, auteur_id, annee_publication) VALUES ($1, $2, $3) RETURNING *',
      [titre, auteur_id, annee_publication || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}


async function updateLivre(req, res, next) {
  try {
    const { id } = req.params;
    const { titre, auteur_id, annee_publication } = req.body;

    const auteur = await pool.query('SELECT id FROM auteurs WHERE id = $1', [auteur_id]);
    if (auteur.rows.length === 0) {
      return next(new AppError('Auteur introuvable pour cet auteur_id.', 400));
    }

    const result = await pool.query(
      'UPDATE livres SET titre = $1, auteur_id = $2, annee_publication = $3 WHERE id = $4 RETURNING *',
      [titre, auteur_id, annee_publication || null, id]
    );
    if (result.rows.length === 0) {
      return next(new AppError('Livre introuvable.', 404));
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteLivre(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM livres WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return next(new AppError('Livre introuvable.', 404));
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === '23503') {
      return next(new AppError('Impossible de supprimer : ce livre a des emprunts associés.', 409));
    }
    next(err);
  }
}

module.exports = {
  getAllLivres,
  getLivreById,
  createLivre,
  updateLivre,
  deleteLivre,
};