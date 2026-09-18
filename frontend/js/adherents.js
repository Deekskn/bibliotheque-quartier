const corpsTableau = document.getElementById('corps-tableau-adherents');
const form = document.getElementById('form-adherent');
const champId = document.getElementById('adherent-id');
const champNom = document.getElementById('adherent-nom');
const champPrenom = document.getElementById('adherent-prenom');
const champContact = document.getElementById('adherent-contact');
const titreFormulaire = document.getElementById('titre-formulaire');
const boutonSubmit = document.getElementById('bouton-submit');
const boutonAnnuler = document.getElementById('bouton-annuler');
const zoneHistorique = document.getElementById('zone-historique');
const titreHistorique = document.getElementById('titre-historique');
const corpsHistorique = document.getElementById('corps-tableau-historique');

async function chargerAdherents() {
  try {
    const adherents = await api.get('/adherents');

    if (adherents.length === 0) {
      corpsTableau.innerHTML = '<tr><td colspan="4" class="vide">Aucun adhérent enregistré.</td></tr>';
      return;
    }

    corpsTableau.innerHTML = adherents
      .map(
        (a) => `
      <tr>
        <td>${a.nom}</td>
        <td>${a.prenom}</td>
        <td>${a.contact}</td>
        <td class="actions-cellule">
          <button onclick="voirHistorique(${a.id}, '${echapper(a.prenom)} ${echapper(a.nom)}')">Historique</button>
          <button class="secondaire" onclick="preparerEdition(${a.id}, '${echapper(a.nom)}', '${echapper(a.prenom)}', '${echapper(a.contact)}')">Modifier</button>
          <button class="danger" onclick="supprimerAdherent(${a.id})">Supprimer</button>
        </td>
      </tr>`
      )
      .join('');
  } catch (err) {
    corpsTableau.innerHTML = `<tr><td colspan="4" class="vide">Erreur : ${err.message}</td></tr>`;
  }
}

function echapper(texte) {
  return String(texte).replace(/'/g, "\\'");
}

async function voirHistorique(id, nomComplet) {
  try {
    const historique = await api.get(`/adherents/${id}/emprunts`);
    titreHistorique.textContent = `Historique des emprunts — ${nomComplet}`;
    zoneHistorique.style.display = 'block';

    if (historique.length === 0) {
      corpsHistorique.innerHTML = '<tr><td colspan="4" class="vide">Aucun emprunt pour cet adhérent.</td></tr>';
    } else {
      corpsHistorique.innerHTML = historique
        .map(
          (e) => `
        <tr>
          <td>${e.titre}</td>
          <td>${formaterDate(e.date_emprunt)}</td>
          <td>${formaterDate(e.date_retour_prevue)}</td>
          <td><span class="badge badge-${e.statut}">${libelleStatut(e.statut)}</span></td>
        </tr>`
        )
        .join('');
    }
    zoneHistorique.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
}

function libelleStatut(statut) {
  return { en_cours: 'En cours', en_retard: 'En retard', rendu: 'Rendu' }[statut] || statut;
}

function preparerEdition(id, nom, prenom, contact) {
  champId.value = id;
  champNom.value = nom;
  champPrenom.value = prenom;
  champContact.value = contact;
  titreFormulaire.textContent = 'Modifier l\'adhérent';
  boutonSubmit.textContent = 'Enregistrer';
  boutonAnnuler.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reinitialiserFormulaire() {
  form.reset();
  champId.value = '';
  titreFormulaire.textContent = 'Ajouter un adhérent';
  boutonSubmit.textContent = 'Ajouter';
  boutonAnnuler.style.display = 'none';
}

boutonAnnuler.addEventListener('click', reinitialiserFormulaire);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const corps = {
    nom: champNom.value.trim(),
    prenom: champPrenom.value.trim(),
    contact: champContact.value.trim(),
  };

  try {
    if (champId.value) {
      await api.put(`/adherents/${champId.value}`, corps);
      afficherSucces('succes-form', 'Adhérent modifié avec succès.');
    } else {
      await api.post('/adherents', corps);
      afficherSucces('succes-form', 'Adhérent ajouté avec succès.');
    }
    reinitialiserFormulaire();
    chargerAdherents();
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
});

async function supprimerAdherent(id) {
  if (!confirm('Supprimer cet adhérent ? Ses emprunts seront également supprimés.')) return;
  try {
    await api.delete(`/adherents/${id}`);
    chargerAdherents();
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
}

chargerAdherents();