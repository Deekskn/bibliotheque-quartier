async function chargerStats() {
  try {
    const stats = await api.get('/stats');

    const grille = document.getElementById('grille-stats');
    grille.innerHTML = `
      <div class="stat-carte"><div class="valeur">${stats.total_livres}</div><div class="libelle">Livres</div></div>
      <div class="stat-carte"><div class="valeur">${stats.total_adherents}</div><div class="libelle">Adhérents</div></div>
      <div class="stat-carte"><div class="valeur">${stats.emprunts_en_cours}</div><div class="libelle">Emprunts en cours</div></div>
      <div class="stat-carte"><div class="valeur">${stats.emprunts_en_retard}</div><div class="libelle">Emprunts en retard</div></div>
    `;

    const livrePlusEmprunte = document.getElementById('livre-plus-emprunte');
    livrePlusEmprunte.textContent = stats.livre_plus_emprunte
      ? `« ${stats.livre_plus_emprunte.titre} » — ${stats.livre_plus_emprunte.nombre_emprunts} emprunt(s)`
      : 'Aucun emprunt enregistré pour le moment.';

    const adherentPlusActif = document.getElementById('adherent-plus-actif');
    adherentPlusActif.textContent = stats.adherent_plus_actif
      ? `${stats.adherent_plus_actif.prenom} ${stats.adherent_plus_actif.nom} — ${stats.adherent_plus_actif.nombre_emprunts} emprunt(s)`
      : 'Aucun emprunt enregistré pour le moment.';
  } catch (err) {
    document.getElementById('grille-stats').innerHTML = `<p class="vide">Erreur de chargement : ${err.message}</p>`;
  }
}

chargerStats();