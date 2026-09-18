const pool = require('../config/database');

async function getStats(req, res, next) {
  try {
    const [totalLivres, totalAdherents, empruntsEnCours, empruntsEnRetard, livrePlusEmprunte, adherentPlusActif] =
      await Promise.all([
        pool.query('SELECT COUNT(*) FROM livres'),
        pool.query('SELECT COUNT(*) FROM adherents'),
        pool.query('SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL'),
        pool.query(
          `SELECT COUNT(*) FROM emprunts
           WHERE date_retour_effective IS NULL AND date_retour_prevue < CURRENT_DATE`
        ),
        pool.query(
          `SELECT l.id, l.titre, COUNT(*) AS nombre_emprunts
           FROM emprunts e
           JOIN livres l ON l.id = e.livre_id
           GROUP BY l.id, l.titre
           ORDER BY nombre_emprunts DESC
           LIMIT 1`
        ),
        pool.query(
          `SELECT ad.id, ad.nom, ad.prenom, COUNT(*) AS nombre_emprunts
           FROM emprunts e
           JOIN adherents ad ON ad.id = e.adherent_id
           GROUP BY ad.id, ad.nom, ad.prenom
           ORDER BY nombre_emprunts DESC
           LIMIT 1`
        ),
      ]);

    res.json({
      total_livres: parseInt(totalLivres.rows[0].count, 10),
      total_adherents: parseInt(totalAdherents.rows[0].count, 10),
      emprunts_en_cours: parseInt(empruntsEnCours.rows[0].count, 10),
      emprunts_en_retard: parseInt(empruntsEnRetard.rows[0].count, 10),
      livre_plus_emprunte: livrePlusEmprunte.rows[0] || null,
      adherent_plus_actif: adherentPlusActif.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };