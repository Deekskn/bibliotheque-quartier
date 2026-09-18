const corpsTableau = document.getElementById('corps-tableau-livres');
const form = document.getElementById('form-livre');
const champId = document.getElementById('livre-id');
const champTitre = document.getElementById('livre-titre');
const champAuteur = document.getElementById('livre-auteur');
const champAnnee = document.getElementById('livre-annee');
const titreFormulaire = document.getElementById('titre-formulaire');
const boutonSubmit = document.getElementById('bouton-submit');
const boutonAnnuler = document.getElementById('bouton-annuler');
const champRecherche = document.getElementById('champ-recherche');
const boutonRecherche = document.getElementById('bouton-recherche');
const boutonReinitRecherche = document.getElementById('bouton-reinit-recherche');
const zonePagination = document.getElementById('zone-pagination');

let pageActuelle = 1;
const LIMITE_PAR_PAGE = 8;
let rechercheActuelle = '';

async function chargerAuteursDansSelect() {
  try {
    const auteurs = await api.get('/auteurs');
    champAuteur.innerHTML =
      '<option value="">-- Choisir un auteur --</option>' +
      auteurs.map((a) => `<option value="${a.id}">${a.prenom} ${a.nom}</option>`).join('');
  } catch (err) {
    afficherErreur('erreur-form', 'Impossible de charger les auteurs : ' + err.message);
  }
}

async function chargerLivres() {
  try {
    const params = new URLSearchParams({ page: pageActuelle, limit: LIMITE_PAR_PAGE });
    if (rechercheActuelle) params.set('search', rechercheActuelle);

    const reponse = await api.get(`/livres?${params.toString()}`);
    const { donnees, pagination } = reponse;

    if (donnees.length === 0) {
      corpsTableau.innerHTML = '<tr><td colspan="5" class="vide">Aucun livre trouvé.</td></tr>';
    } else {
      corpsTableau.innerHTML = donnees
        .map(
          (l) => `
        <tr>
          <td>${l.titre}</td>
          <td>${l.auteur_prenom} ${l.auteur_nom}</td>
          <td>${l.annee_publication || '-'}</td>
          <td><span class="badge badge-${l.disponible ? 'disponible' : 'emprunte'}">${l.disponible ? 'Disponible' : 'Emprunté'}</span></td>
          <td class="actions-cellule">
            <button class="secondaire" onclick='preparerEdition(${l.id}, ${JSON.stringify(l.titre)}, ${l.auteur_id}, ${l.annee_publication || 'null'})'>Modifier</button>
            <button class="danger" onclick="supprimerLivre(${l.id})">Supprimer</button>
          </td>
        </tr>`
        )
        .join('');
    }

    afficherPagination(pagination);
  } catch (err) {
    corpsTableau.innerHTML = `<tr><td colspan="5" class="vide">Erreur : ${err.message}</td></tr>`;
  }
}

function afficherPagination(pagination) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) {
    zonePagination.innerHTML = '';
    return;
  }
  zonePagination.innerHTML = `
    <button class="secondaire" ${page <= 1 ? 'disabled' : ''} onclick="changerPage(${page - 1})">« Précédent</button>
    <span>Page ${page} / ${totalPages}</span>
    <button class="secondaire" ${page >= totalPages ? 'disabled' : ''} onclick="changerPage(${page + 1})">Suivant »</button>
  `;
}

function changerPage(nouvellePage) {
  pageActuelle = nouvellePage;
  chargerLivres();
}

boutonRecherche.addEventListener('click', () => {
  rechercheActuelle = champRecherche.value.trim();
  pageActuelle = 1;
  chargerLivres();
});

champRecherche.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    boutonRecherche.click();
  }
});

boutonReinitRecherche.addEventListener('click', () => {
  champRecherche.value = '';
  rechercheActuelle = '';
  pageActuelle = 1;
  chargerLivres();
});

function preparerEdition(id, titre, auteurId, annee) {
  champId.value = id;
  champTitre.value = titre;
  champAuteur.value = auteurId;
  champAnnee.value = annee || '';
  titreFormulaire.textContent = 'Modifier le livre';
  boutonSubmit.textContent = 'Enregistrer';
  boutonAnnuler.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reinitialiserFormulaire() {
  form.reset();
  champId.value = '';
  titreFormulaire.textContent = 'Ajouter un livre';
  boutonSubmit.textContent = 'Ajouter';
  boutonAnnuler.style.display = 'none';
}

boutonAnnuler.addEventListener('click', reinitialiserFormulaire);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const corps = {
    titre: champTitre.value.trim(),
    auteur_id: Number(champAuteur.value),
    annee_publication: champAnnee.value ? Number(champAnnee.value) : null,
  };

  try {
    if (champId.value) {
      await api.put(`/livres/${champId.value}`, corps);
      afficherSucces('succes-form', 'Livre modifié avec succès.');
    } else {
      await api.post('/livres', corps);
      afficherSucces('succes-form', 'Livre ajouté avec succès.');
    }
    reinitialiserFormulaire();
    chargerLivres();
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
});

async function supprimerLivre(id) {
  if (!confirm('Supprimer ce livre ? Ses emprunts seront également supprimés.')) return;
  try {
    await api.delete(`/livres/${id}`);
    chargerLivres();
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
}

chargerAuteursDansSelect();
chargerLivres();