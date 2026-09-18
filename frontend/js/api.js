// frontend/js/api.js

const API_BASE = '/api';

async function appelApi(chemin, options = {}) {
  const reponse = await fetch(`${API_BASE}${chemin}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // 204 No Content : pas de corps JSON à lire
  if (reponse.status === 204) {
    return null;
  }

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    const message = (donnees && donnees.message) || `Erreur ${reponse.status}`;
    throw new Error(message);
  }

  return donnees;
}

const api = {
  get: (chemin) => appelApi(chemin),
  post: (chemin, corps) => appelApi(chemin, { method: 'POST', body: JSON.stringify(corps) }),
  put: (chemin, corps) => appelApi(chemin, { method: 'PUT', body: JSON.stringify(corps) }),
  delete: (chemin) => appelApi(chemin, { method: 'DELETE' }),
};

// Affiche un message d'erreur dans un élément donné (id du conteneur)
function afficherErreur(idConteneur, message) {
  const el = document.getElementById(idConteneur);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 5000);
}

function afficherSucces(idConteneur, message) {
  const el = document.getElementById(idConteneur);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 4000);
}

function formaterDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR');
}