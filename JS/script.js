let formulaire = document.getElementById("formulaire");
formulaire.addEventListener("submit", traiterFormulaire);

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

    recupererDonnees(type_recherche, mot_cle);
}

function recupererDonnees(type_recherche, mot_cle) {
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
    }
    else {
        console.error("Type de recherche inconnu :", type_recherche);
        return;
    }

    console.log("URL :", url);
    xhr.open('GET', url);
    xhr.setRequestHeader('x-rapidapi-key', '9e5903b096mshc6296e5f055eb5bp152ce7jsn26bd612daa06');
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
            <img src="${anime.image}" alt="${anime.title}">
            <h3>${anime.title}</h3>
            <p><strong>Genres :</strong> ${genres}</p>
            <p><strong>Épisodes :</strong> ${anime.episodes || "Inconnu"}</p>
            <p><strong>Rang :</strong> ${anime.ranking || "N/A"}</p>
            <p><strong>Synopsis :</strong> ${anime.synopsis || "Aucun synopsis disponible."}</p>
            ${anime.link ? `<a href="${anime.link}" target="_blank">Voir sur MyAnimeList</a>` : ""}
        `;

        conteneur.appendChild(card);
    });
}