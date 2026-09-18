-- Schéma de la base de données : Bibliothèque de quartier

-- Supprimer la table si elle existe déjà

DROP TABLE IF EXISTS livres;
DROP TABLE IF EXISTS auteurs;
DROP TABLE IF EXISTS emprunts;
DROP TABLE IF EXISTS adherents;

-- Table des auteurs
CREATE TABLE auteurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    prenom VARCHAR(150) NOT NULL,
    nationalite VARCHAR(100)
);

-- Table des adhérents
CREATE TABLE adherents (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    prenom VARCHAR(150) NOT NULL,
    contact VARCHAR(150)
);

-- Table des livres
CREATE TABLE livres (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    auteur_id INTEGER NOT NULL REFERENCES auteurs(id),
    annee_publication INTEGER,
    disponible BOOLEAN NOT NULL DEFAULT TRUE
);

-- Table des emprunts
CREATE TABLE emprunts (
    id SERIAL PRIMARY KEY,
    livre_id INTEGER NOT NULL REFERENCES livres(id),
    adherent_id INTEGER NOT NULL REFERENCES adherents(id),
    date_emprunt DATE NOT NULL DEFAULT CURRENT_DATE,
    date_retour_prevue DATE NOT NULL,
    date_retour_effective DATE
);

-- Index pour accélérer les recherches fréquentes
CREATE INDEX idx_livre_auteur ON livres(auteur_id);
CREATE INDEX idx_emprunt_livre ON emprunts(livre_id);
CREATE INDEX idx_emprunt_adherent ON emprunts(adherent_id);
CREATE INDEX idx_emprunt_date_retour ON emprunts(date_retour_prevue);
CREATE INDEX idx_livre_titre ON livres(titre);

--Contraintes pour la date de retour 
ALTER TABLE emprunts
    ADD CONSTRAINT chk_date_emprunt CHECK (date_retour_prevue >= date_emprunt);