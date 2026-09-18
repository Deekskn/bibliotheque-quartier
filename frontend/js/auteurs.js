const corpsTableau = document.getElementById('corps-tableau-auteurs');
const form = document.getElementById('form-auteur');
const champId = document.getElementById('auteur-id');
const champNom = document.getElementById('auteur-nom');
const champPrenom = document.getElementById('auteur-prenom');
const champNationalite = document.getElementById('auteur-nationalite');
const titreFormulaire = document.getElementById('titre-formulaire');
const boutonSubmit = document.getElementById('bouton-submit');
const boutonAnnuler = document.getElementById('bouton-annuler');

async function chargerAuteurs() {
  try {
    const auteurs = await api.get('/auteurs');

    if (auteurs.length === 0) {
      corpsTableau.innerHTML = '<tr><td colspan="4" class="vide">Aucun auteur enregistré.</td></tr>';
      return;
    }

    corpsTableau.innerHTML = auteurs
      .map(
        (a) => `
      <tr>
        <td>${a.nom}</td>
        <td>${a.prenom}</td>
        <td>${a.nationalite || '-'}</td>
        <td class="actions-cellule">
          <button class="secondaire" onclick="preparerEdition(${a.id}, '${echapper(a.nom)}', '${echapper(a.prenom)}', '${echapper(a.nationalite || '')}')">Modifier</button>
          <button class="danger" onclick="supprimerAuteur(${a.id})">Supprimer</button>
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

function preparerEdition(id, nom, prenom, nationalite) {
  champId.value = id;
  champNom.value = nom;
  champPrenom.value = prenom;
  champNationalite.value = nationalite;
  titreFormulaire.textContent = 'Modifier l\'auteur';
  boutonSubmit.textContent = 'Enregistrer';
  boutonAnnuler.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reinitialiserFormulaire() {
  form.reset();
  champId.value = '';
  titreFormulaire.textContent = 'Ajouter un auteur';
  boutonSubmit.textContent = 'Ajouter';
  boutonAnnuler.style.display = 'none';
}

boutonAnnuler.addEventListener('click', reinitialiserFormulaire);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const corps = {
    nom: champNom.value.trim(),
    prenom: champPrenom.value.trim(),
    nationalite: champNationalite.value.trim() || null,
  };

  try {
    if (champId.value) {
      await api.put(`/auteurs/${champId.value}`, corps);
      afficherSucces('succes-form', 'Auteur modifié avec succès.');
    } else {
      await api.post('/auteurs', corps);
      afficherSucces('succes-form', 'Auteur ajouté avec succès.');
    }
    reinitialiserFormulaire();
    chargerAuteurs();
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
});

async function supprimerAuteur(id) {
  if (!confirm('Supprimer cet auteur ? Ses livres seront également supprimés.')) return;
  try {
    await api.delete(`/auteurs/${id}`);
    chargerAuteurs();
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
}

chargerAuteurs();