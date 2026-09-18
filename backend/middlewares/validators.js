// backend/middlewares/validators.js

const AppError = require('../utils/AppError');

function estChaineNonVide(valeur) {
  return typeof valeur === 'string' && valeur.trim().length > 0;
}

function validateAuteur(req, res, next) {
  const { nom, prenom } = req.body;
  if (!estChaineNonVide(nom) || !estChaineNonVide(prenom)) {
    return next(new AppError('Les champs "nom" et "prenom" sont obligatoires.', 400));
  }
  next();
}

function validateAdherent(req, res, next) {
  const { nom, prenom, contact } = req.body;
  if (!estChaineNonVide(nom) || !estChaineNonVide(prenom) || !estChaineNonVide(contact)) {
    return next(new AppError('Les champs "nom", "prenom" et "contact" sont obligatoires.', 400));
  }
  next();
}

function validateLivre(req, res, next) {
  const { titre, auteur_id, annee_publication } = req.body;
  if (!estChaineNonVide(titre)) {
    return next(new AppError('Le champ "titre" est obligatoire.', 400));
  }
  if (!auteur_id || Number.isNaN(Number(auteur_id))) {
    return next(new AppError('Le champ "auteur_id" doit être un identifiant valide.', 400));
  }
  if (annee_publication !== undefined && Number.isNaN(Number(annee_publication))) {
    return next(new AppError('Le champ "annee_publication" doit être un nombre.', 400));
  }
  next();
}

function validateEmprunt(req, res, next) {
  const { adherent_id, livre_id, date_retour_prevue } = req.body;
  if (!adherent_id || Number.isNaN(Number(adherent_id))) {
    return next(new AppError('Le champ "adherent_id" doit être un identifiant valide.', 400));
  }
  if (!livre_id || Number.isNaN(Number(livre_id))) {
    return next(new AppError('Le champ "livre_id" doit être un identifiant valide.', 400));
  }
  if (!estChaineNonVide(date_retour_prevue) || Number.isNaN(Date.parse(date_retour_prevue))) {
    return next(new AppError('Le champ "date_retour_prevue" doit être une date valide (AAAA-MM-JJ).', 400));
  }
  next();
}

module.exports = {
  validateAuteur,
  validateAdherent,
  validateLivre,
  validateEmprunt,
};