const corpsTableau = document.getElementById('corps-tableau-emprunts');
const form = document.getElementById('form-emprunt');
const champLivre = document.getElementById('emprunt-livre');
const champAdherent = document.getElementById('emprunt-adherent');
const champDateRetour = document.getElementById('emprunt-date-retour');
const boutonsFiltre = document.querySelectorAll('.filtre');

let emprunts = [];
let filtreActuel = 'tous';

async function chargerLivresDisponiblesDansSelect() {
  try {
    const reponse = await api.get('/livres?limit=1000');
    const livres = reponse.donnees || reponse;
    const disponibles = livres.filter((l) => l.disponible);
    champLivre.innerHTML =
      '<option value="">-- Choisir un livre disponible --</option>' +
      disponibles.map((l) => `<option value="${l.id}">${l.titre} — ${l.auteur_prenom} ${l.auteur_nom}</option>`).join('');
  } catch (err) {
    afficherErreur('erreur-form', 'Impossible de charger les livres : ' + err.message);
  }
}

async function chargerAdherentsDansSelect() {
  try {
    const adherents = await api.get('/adherents');
    champAdherent.innerHTML =
      '<option value="">-- Choisir un adhérent --</option>' +
      adherents.map((a) => `<option value="${a.id}">${a.prenom} ${a.nom}</option>`).join('');
  } catch (err) {
    afficherErreur('erreur-form', 'Impossible de charger les adhérents : ' + err.message);
  }
}

function calculerStatut(emprunt) {
  if (emprunt.date_retour_effective) return 'rendu';
  const aujourdHui = new Date().toISOString().slice(0, 10);
  return emprunt.date_retour_prevue < aujourdHui ? 'en_retard' : 'en_cours';
}

function libelleStatut(statut) {
  return { en_cours: 'En cours', en_retard: 'En retard', rendu: 'Rendu' }[statut] || statut;
}

function formaterDate(dateIso) {
  if (!dateIso) return '-';
  const d = new Date(dateIso);
  return d.toLocaleDateString('fr-FR');
}

async function chargerEmprunts() {
  try {
    const donnees = await api.get('/emprunts');
    emprunts = donnees.map((e) => ({ ...e, statut: calculerStatut(e) }));
    afficherEmprunts();
  } catch (err) {
    corpsTableau.innerHTML = `<tr><td colspan="6" class="vide">Erreur : ${err.message}</td></tr>`;
  }
}

function afficherEmprunts() {
  const liste = filtreActuel === 'tous' ? emprunts : emprunts.filter((e) => e.statut === filtreActuel);

  if (liste.length === 0) {
    corpsTableau.innerHTML = '<tr><td colspan="6" class="vide">Aucun emprunt à afficher.</td></tr>';
    return;
  }

  corpsTableau.innerHTML = liste
    .map(
      (e) => `
    <tr>
      <td>${e.titre}</td>
      <td>${e.adherent_prenom} ${e.adherent_nom}</td>
      <td>${formaterDate(e.date_emprunt)}</td>
      <td>${formaterDate(e.date_retour_prevue)}</td>
      <td><span class="badge badge-${e.statut}">${libelleStatut(e.statut)}</span></td>
      <td class="actions-cellule">
        ${e.statut !== 'rendu' ? `<button onclick="marquerRendu(${e.id})">Marquer comme rendu</button>` : '-'}
      </td>
    </tr>`
    )
    .join('');
}

boutonsFiltre.forEach((bouton) => {
  bouton.addEventListener('click', () => {
    boutonsFiltre.forEach((b) => b.classList.remove('actif'));
    bouton.classList.add('actif');
    filtreActuel = bouton.dataset.filtre;
    afficherEmprunts();
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const corps = {
    livre_id: Number(champLivre.value),
    adherent_id: Number(champAdherent.value),
    date_retour_prevue: champDateRetour.value,
  };

  try {
    await api.post('/emprunts', corps);
    afficherSucces('succes-form', 'Emprunt enregistré avec succès.');
    form.reset();
    chargerLivresDisponiblesDansSelect();
    chargerEmprunts();
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
});

async function marquerRendu(id) {
  if (!confirm('Confirmer le retour de ce livre ?')) return;
  try {
    await api.put(`/emprunts/${id}/retour`, {});
    chargerLivresDisponiblesDansSelect();
    chargerEmprunts();
  } catch (err) {
    afficherErreur('erreur-form', err.message);
  }
}

chargerLivresDisponiblesDansSelect();
chargerAdherentsDansSelect();
chargerEmprunts();