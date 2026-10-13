const formulaire = document.getElementById("formulaire");
formulaire.addEventListener("submit", traiterFormulaire);

function traiterFormulaire(event) {
    event.preventDefault();

    const type_recherche = document.getElementById("type_recherche").value;
    const mot_cle = document.getElementById("mot_cle").value.trim();

    if (!mot_cle) {
        afficherMessage("Veuillez saisir un paramètre de recherche.");
        return;
    }

    recupererDonnees(type_recherche, mot_cle);
}

function recupererDonnees(type_recherche, mot_cle) {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
            if (this.status === 0) {
                return;
            }

            if (this.status < 200 || this.status >= 300) {
                console.error("Erreur HTTP :", this.status);
                afficherMessage(`Erreur lors de la recherche (code ${this.status}). Réessayez plus tard.`);
                return;
            }

            let resultat;
            try {
                resultat = JSON.parse(this.responseText);
            } catch (e) {
                console.error("Réponse non JSON :", e);
                afficherMessage("Réponse invalide du serveur. Réessayez plus tard.");
                return;
            }
            afficherResultats(resultat);
        }
    });

    xhr.addEventListener('error', function () {
        console.error("Erreur réseau");
        afficherMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
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

    xhr.open('GET', url);
    xhr.setRequestHeader('x-rapidapi-key', '8bdf5aefc5msh5cdc0842b82656dp1e3d36jsnd56ae71fa5af');
    xhr.setRequestHeader('x-rapidapi-host', 'anime-db.p.rapidapi.com');

    xhr.send();
}

function echapper(texte) {
    return String(texte)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function afficherMessage(message) {
    const conteneur = document.getElementById("resultats");
    conteneur.innerHTML = `<p>${echapper(message)}</p>`;
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
            <img src="${echapper(anime.image)}" alt="${echapper(anime.title)}" width="115" height="170" loading="lazy">
            <h2>${echapper(anime.title)}</h2>
            <p><strong>Genres :</strong> ${echapper(genres)}</p>
            <p><strong>Épisodes :</strong> ${echapper(anime.episodes || "Inconnu")}</p>
            <p><strong>Rang :</strong> ${echapper(anime.ranking || "N/A")}</p>
            <p><strong>Synopsis :</strong> ${echapper(anime.synopsis || "Aucun synopsis disponible.")}</p>
            ${anime.link ? `<a href="${echapper(anime.link)}" target="_blank" rel="noopener noreferrer">Voir sur MyAnimeList</a>` : ""}
        `;

        conteneur.appendChild(card);
    });
}
