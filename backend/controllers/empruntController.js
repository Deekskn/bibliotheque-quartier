const pool = require('../config/database');
const AppError = require('../utils/AppError');

async function getAllEmprunts(req, res, next) {
  try {
    const statut = req.query.statut || 'tous';

    let filtre = '';
    if (statut === 'en_cours') {
      filtre = 'WHERE e.date_retour_effective IS NULL';
    } else if (statut === 'en_retard') {
      filtre = 'WHERE e.date_retour_effective IS NULL AND e.date_retour_prevue < CURRENT_DATE';
    }

    const result = await pool.query(
      `SELECT e.id, e.date_emprunt, e.date_retour_prevue, e.date_retour_effective,
              l.id AS livre_id, l.titre AS livre_titre,
              ad.id AS adherent_id, ad.nom AS adherent_nom, ad.prenom AS adherent_prenom,
              CASE
                WHEN e.date_retour_effective IS NOT NULL THEN 'rendu'
                WHEN e.date_retour_prevue < CURRENT_DATE THEN 'en_retard'
                ELSE 'en_cours'
              END AS statut
       FROM emprunts e
       JOIN livres l ON l.id = e.livre_id
       JOIN adherents ad ON ad.id = e.adherent_id
       ${filtre}
       ORDER BY e.date_emprunt DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createEmprunt(req, res, next) {
  const client = await pool.connect();
  try {
    const { adherent_id, livre_id, date_retour_prevue } = req.body;

    await client.query('BEGIN');

    const livre = await client.query('SELECT * FROM livres WHERE id = $1 FOR UPDATE', [livre_id]);
    if (livre.rows.length === 0) {
      await client.query('ROLLBACK');
      return next(new AppError('Livre introuvable.', 404));
    }
    if (!livre.rows[0].disponible) {
      await client.query('ROLLBACK');
      return next(new AppError('Ce livre est déjà emprunté.', 409));
    }

    const adherent = await client.query('SELECT id FROM adherents WHERE id = $1', [adherent_id]);
    if (adherent.rows.length === 0) {
      await client.query('ROLLBACK');
      return next(new AppError('Adhérent introuvable.', 404));
    }

    const nouvelEmprunt = await client.query(
      `INSERT INTO emprunts (adherent_id, livre_id, date_retour_prevue)
       VALUES ($1, $2, $3) RETURNING *`,
      [adherent_id, livre_id, date_retour_prevue]
    );

    await client.query('UPDATE livres SET disponible = FALSE WHERE id = $1', [livre_id]);

    await client.query('COMMIT');
    res.status(201).json(nouvelEmprunt.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function retournerEmprunt(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const emprunt = await client.query('SELECT * FROM emprunts WHERE id = $1 FOR UPDATE', [id]);
    if (emprunt.rows.length === 0) {
      await client.query('ROLLBACK');
      return next(new AppError('Emprunt introuvable.', 404));
    }
    if (emprunt.rows[0].date_retour_effective) {
      await client.query('ROLLBACK');
      return next(new AppError('Ce livre a déjà été rendu.', 409));
    }

    const empruntMisAJour = await client.query(
      `UPDATE emprunts SET date_retour_effective = CURRENT_DATE WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('UPDATE livres SET disponible = TRUE WHERE id = $1', [emprunt.rows[0].livre_id]);

    await client.query('COMMIT');
    res.json(empruntMisAJour.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = {
  getAllEmprunts,
  createEmprunt,
  retournerEmprunt,
};