let formulaire = document.getElementById("formulaire");
formulaire.addEventListener("submit", traiterFormulaire);

const champCleApi = document.getElementById("api-key");
const infoCleApi = document.getElementById("api-key-info");
const stockageCleApi = "anime-requester-api-key";

try {
    champCleApi.value = sessionStorage.getItem(stockageCleApi) || "";
} catch (e) {
    infoCleApi.textContent = "Stockage indisponible : saisissez votre clé à chaque chargement.";
}

champCleApi.addEventListener("input", () => {
    const cleApi = champCleApi.value.trim();
    try {
        if (cleApi) {
            sessionStorage.setItem(stockageCleApi, cleApi);
        } else {
            sessionStorage.removeItem(stockageCleApi);
        }
        infoCleApi.textContent = "Clé conservée pour cette session uniquement.";
    } catch (e) {
        infoCleApi.textContent = "Stockage indisponible : saisissez votre clé à chaque chargement.";
    }
});

const selectRecherche = document.getElementById("type_recherche");
const filtresGenres = document.getElementById("filtres_genres");

function actualiserFiltresGenres() {
    const rechercheParTitre = selectRecherche.value === "recherche_titre";
    filtresGenres.hidden = !rechercheParTitre;
    filtresGenres.disabled = !rechercheParTitre;
}

selectRecherche.addEventListener("change", actualiserFiltresGenres);
formulaire.addEventListener("reset", () => {
    // Le navigateur restaure les valeurs après l'événement reset.
    setTimeout(actualiserFiltresGenres, 0);
});
actualiserFiltresGenres();

let type_recherche;
let mot_cle;
let resultat;

function traiterFormulaire(event) {
    event.preventDefault();

    type_recherche = document.getElementById("type_recherche").value;
    mot_cle = document.getElementById("mot_cle").value.trim();
    console.log("Type de recherche sélectionné : " + type_recherche);
    console.log("Mot clé saisi : " + mot_cle);

    if (!mot_cle) {
        afficherMessage("Veuillez saisir un paramètre de recherche.");
        return;
    }

    const genresSelectionnes = type_recherche === "recherche_titre"
        ? Array.from(formulaire.querySelectorAll('input[name="genres"]:checked'), caseGenre => caseGenre.value)
        : [];

    recupererDonnees(type_recherche, mot_cle, genresSelectionnes);
}

function recupererDonnees(type_recherche, mot_cle, genresSelectionnes = []) {
    const cleApi = champCleApi.value.trim();
    if (!cleApi) {
        afficherMessage("Veuillez saisir votre clé API pour lancer la recherche.");
        champCleApi.focus();
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
            console.log("Statut :", this.status);
            console.log("Réponse brute :", this.responseText);

            try {
                resultat = JSON.parse(this.responseText);
            } catch (e) {
                console.error("Réponse non JSON :", e);
                return;
            }
            console.log("Résultat de la requête : ", resultat);
            afficherResultats(resultat);
        }
    });

    let url;
    if (type_recherche === "recherche_genre") {
        mot_cle = mot_cle.charAt(0).toUpperCase() + mot_cle.slice(1).toLowerCase();
        url = `https://anime-db.p.rapidapi.com/anime?page=1&size=10&genres=${encodeURIComponent(mot_cle)}&sortBy=ranking&sortOrder=asc`;
    }
    else if (type_recherche === "recherche_titre") {
        url = `https://anime-db.p.rapidapi.com/anime?page=1&size=10&search=${encodeURIComponent(mot_cle)}&sortBy=ranking&sortOrder=asc`;
        if (genresSelectionnes.length > 0) {
            url += `&genres=${encodeURIComponent(genresSelectionnes.join(","))}`;
        }
    }
    else {
        console.error("Type de recherche inconnu :", type_recherche);
        return;
    }

    console.log("URL :", url);
    xhr.open('GET', url);
    xhr.setRequestHeader('x-rapidapi-key', cleApi);
    xhr.setRequestHeader('x-rapidapi-host', 'anime-db.p.rapidapi.com');

    xhr.send();
}

function afficherMessage(message) {
    const conteneur = document.getElementById("resultats");
    conteneur.innerHTML = `<p>${message}</p>`;
}

function afficherResultats(resultat) {
    const conteneur = document.getElementById("resultats");
    conteneur.innerHTML = "";

    if (!resultat || !resultat.data || resultat.data.length === 0) {
        afficherMessage("Aucun anime trouvé.");
        return;
    }

    resultat.data.forEach(anime => {
        const card = document.createElement("div");
        card.className = "card";

        const genres = Array.isArray(anime.genres) ? anime.genres.join(", ") : anime.genres;

        card.innerHTML = `
            <img src="${anime.image}" alt="${anime.title}" width="115" height="170" loading="lazy">
            <h2>${anime.title}</h2>
            <p><strong>Genres :</strong> ${genres}</p>
            <p><strong>Épisodes :</strong> ${anime.episodes || "Inconnu"}</p>
            <p><strong>Rang :</strong> ${anime.ranking || "N/A"}</p>
            <p><strong>Synopsis :</strong> ${anime.synopsis || "Aucun synopsis disponible."}</p>
            ${anime.link ? `<a href="${anime.link}" target="_blank" rel="noopener noreferrer">Voir sur MyAnimeList</a>` : ""}
        `;

        conteneur.appendChild(card);
    });
}

// ---------- Bascule de thème (clair / sombre) ----------
const boutonTheme = document.getElementById("theme-toggle");
const iconeTheme = document.getElementById("theme-icon");
const libelleTheme = document.getElementById("theme-label");

function appliquerTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    if (theme === "dark") {
        iconeTheme.textContent = "☀";
        libelleTheme.textContent = "Clair";
        boutonTheme.setAttribute("aria-label", "Passer en mode clair");
    } else {
        iconeTheme.textContent = "☾";
        libelleTheme.textContent = "Sombre";
        boutonTheme.setAttribute("aria-label", "Passer en mode sombre");
    }
}

function basculerTheme() {
    const actuel = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const suivant = actuel === "dark" ? "light" : "dark";
    appliquerTheme(suivant);
    try {
        localStorage.setItem("theme", suivant);
    } catch (e) {
        console.warn("Impossible de mémoriser le thème :", e);
    }
}

// Thème initial : déjà posé par le script du <head>, on synchronise juste le bouton
appliquerTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
boutonTheme.addEventListener("click", basculerTheme);
