let formulaire = document.getElementById("formulaire");
formulaire.addEventListener("submit", traiterFormulaire);
formulaire.addEventListener("reset", function () {
    document.getElementById("mot_cle").removeAttribute("aria-invalid");
});

let type_recherche;
let mot_cle;
let resultat;

function traiterFormulaire(event) {
    event.preventDefault();

    const champ = document.getElementById("mot_cle");
    type_recherche = document.getElementById("type_recherche").value;
    mot_cle = champ.value.trim();
    console.log("Type de recherche sélectionné : " + type_recherche);
    console.log("Mot clé saisi : " + mot_cle);

    if (!mot_cle) {
        // Erreur identifiée en texte, liée au champ, et focus renvoyé sur celui-ci
        champ.setAttribute("aria-invalid", "true");
        afficherMessage("Veuillez saisir un paramètre de recherche : un titre ou un genre.", true);
        champ.focus();
        return;
    }

    champ.removeAttribute("aria-invalid");
    recupererDonnees(type_recherche, mot_cle);
}

function recupererDonnees(type_recherche, mot_cle) {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
            console.log("Statut :", this.status);
            console.log("Réponse brute :", this.responseText);
            indiquerChargement(false);

            if (this.status === 0) {
                afficherMessage("Impossible de contacter le service de recherche. Vérifiez votre connexion internet puis réessayez.", true);
                return;
            }
            if (this.status < 200 || this.status >= 300) {
                afficherMessage("Le service de recherche a renvoyé une erreur (code " + this.status + "). Veuillez réessayer plus tard.", true);
                return;
            }

            try {
                resultat = JSON.parse(this.responseText);
            } catch (e) {
                console.error("Réponse non JSON :", e);
                afficherMessage("La réponse du service de recherche est illisible. Veuillez réessayer.", true);
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
    }
    else {
        console.error("Type de recherche inconnu :", type_recherche);
        return;
    }

    console.log("URL :", url);
    xhr.open('GET', url);
    xhr.setRequestHeader('x-rapidapi-key', '8bdf5aefc5msh5cdc0842b82656dp1e3d36jsnd56ae71fa5af');
    xhr.setRequestHeader('x-rapidapi-host', 'anime-db.p.rapidapi.com');

    indiquerChargement(true);
    xhr.send();
}

// Échappe le texte venant de l'API avant de l'insérer dans le HTML
function echapper(texte) {
    return String(texte === null || texte === undefined ? "" : texte).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

// Annonce aux lecteurs d'écran qu'une recherche est en cours
function indiquerChargement(enCours) {
    document.getElementById("resultats").setAttribute("aria-busy", enCours ? "true" : "false");
    if (enCours) {
        document.getElementById("statut").textContent = "Recherche en cours…";
    }
}

function afficherMessage(message, estErreur) {
    const conteneur = document.getElementById("resultats");
    const statut = document.getElementById("statut");

    if (estErreur) {
        // role="alert" : annoncé immédiatement
        conteneur.innerHTML = `<p role="alert">${message}</p>`;
        statut.textContent = "";
    } else {
        // message d'information : annoncé via la zone de statut
        conteneur.innerHTML = `<p>${message}</p>`;
        statut.textContent = message;
    }
}

function afficherResultats(resultat) {
    const conteneur = document.getElementById("resultats");
    conteneur.innerHTML = "";

    if (!resultat || !resultat.data || resultat.data.length === 0) {
        afficherMessage("Aucun anime trouvé.", false);
        return;
    }

    resultat.data.forEach(anime => {
        const card = document.createElement("article");
        card.className = "card";

        const titre = echapper(anime.title);
        const genresTexte = Array.isArray(anime.genres) ? anime.genres.join(", ") : anime.genres;
        // Genres et synopsis fournis en anglais par l'API (WCAG 3.1.2)
        const genres = genresTexte ? `<span lang="en">${echapper(genresTexte)}</span>` : "Inconnu";
        const synopsis = anime.synopsis ? `<span lang="en">${echapper(anime.synopsis)}</span>` : "Aucun synopsis disponible.";

        card.innerHTML = `
            <img src="${echapper(anime.image)}" alt="Affiche de ${titre}" width="115" height="170" loading="lazy">
            <h2>${titre}</h2>
            <p><strong>Genres :</strong> ${genres}</p>
            <p><strong>Épisodes :</strong> ${echapper(anime.episodes || "Inconnu")}</p>
            <p><strong>Rang :</strong> ${echapper(anime.ranking || "N/A")}</p>
            <p><strong>Synopsis :</strong> ${synopsis}</p>
            ${anime.link ? `<a href="${echapper(anime.link)}" target="_blank" rel="noopener noreferrer">Voir sur MyAnimeList<span class="sr-only"> : ${titre} (s'ouvre dans un nouvel onglet)</span></a>` : ""}
        `;

        conteneur.appendChild(card);
    });

    const nb = resultat.data.length;
    document.getElementById("statut").textContent = nb + (nb > 1 ? " résultats trouvés." : " résultat trouvé.");
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

// ---------- Pause de l'animation de fond (WCAG 2.2.2) ----------
const boutonAnim = document.getElementById("anim-toggle");
const iconeAnim = document.getElementById("anim-icon");
const libelleAnim = document.getElementById("anim-label");

function appliquerAnimation(enPause) {
    document.body.classList.toggle("anim-pause", enPause);

    if (enPause) {
        iconeAnim.textContent = "▶\uFE0E";
        libelleAnim.textContent = "Lecture";
        boutonAnim.setAttribute("aria-label", "Reprendre l'animation de fond");
    } else {
        iconeAnim.textContent = "❚❚";
        libelleAnim.textContent = "Pause";
        boutonAnim.setAttribute("aria-label", "Mettre en pause l'animation de fond");
    }
}

function basculerAnimation() {
    const enPause = !document.body.classList.contains("anim-pause");
    appliquerAnimation(enPause);
    try {
        localStorage.setItem("animation", enPause ? "pause" : "lecture");
    } catch (e) {
        console.warn("Impossible de mémoriser le choix :", e);
    }
}

let animationEnPause = false;
try {
    animationEnPause = localStorage.getItem("animation") === "pause";
} catch (e) { }
appliquerAnimation(animationEnPause);
boutonAnim.addEventListener("click", basculerAnimation);