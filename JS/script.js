// ============================================================
//  Anime Requester - script.js
//  API : AniList GraphQL  (https://graphql.anilist.co)
//  Auteurs : Louis FONTAINE, Matheo GRENECHE, Armand PIVERT,
//            Dylan MESNAGE
// ============================================================

var ANILIST_URL = "https://graphql.anilist.co";

// ---------- Elements DOM ----------
var formulaire   = document.getElementById("formulaire");
var selectType   = document.getElementById("type_recherche");
var champMotCle  = document.getElementById("mot_cle");
var champSaison  = document.getElementById("saison_wrapper");
var selectSaison = document.getElementById("saison");
var selectAnnee  = document.getElementById("annee");
var conteneurRes = document.getElementById("resultats");

// ---------- Initialisation ----------
// Peupler le select des annees (annee en cours jusqu'a 2000)
(function () {
    var anneeActuelle = new Date().getFullYear();
    for (var a = anneeActuelle; a >= 2000; a--) {
        var opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        if (a === anneeActuelle) opt.selected = true;
        selectAnnee.appendChild(opt);
    }
})();

adapterFormulaire();
selectType.addEventListener("change", adapterFormulaire);
formulaire.addEventListener("submit", traiterFormulaire);

// ============================================================
//  Formulaire
// ============================================================

function adapterFormulaire() {
    var type = selectType.value;

    if (type === "recherche_saison") {
        champMotCle.closest(".champ-wrapper").style.display = "none";
        champSaison.style.display = "";
        champMotCle.removeAttribute("required");
    } else {
        champMotCle.closest(".champ-wrapper").style.display = "";
        champSaison.style.display = "none";
        champMotCle.setAttribute("required", "");
    }

    var placeholders = {
        recherche_titre:  "ex : One Piece, Naruto...",
        recherche_genre:  "ex : Action, Comedy, Romance...",
        recherche_saison: ""
    };
    champMotCle.placeholder = placeholders[type] || "";
}

function traiterFormulaire(event) {
    event.preventDefault();

    var type   = selectType.value;
    var motCle = champMotCle.value.trim();

    if (type !== "recherche_saison" && !motCle) {
        afficherMessage("Veuillez saisir un parametre de recherche.");
        return;
    }

    afficherChargement();
    recupererDonnees(type, motCle);
}

// ============================================================
//  Requetes AniList (GraphQL via XHR POST)
// ============================================================

function recupererDonnees(type, motCle) {
    var query, variables;

    if (type === "recherche_titre") {
        // 1. Recherche par titre
        query = [
            "query ($search: String, $perPage: Int) {",
            "  Page(perPage: $perPage) {",
            "    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {",
            "      id title { romaji english native }",
            "      coverImage { large }",
            "      genres episodes averageScore popularity",
            "      season seasonYear",
            "      description(asHtml: false)",
            "      siteUrl",
            "    }",
            "  }",
            "}"
        ].join("\n");
        variables = { search: motCle, perPage: 10 };

    } else if (type === "recherche_genre") {
        // 2. Recherche par genre
        var nomGenre = motCle.charAt(0).toUpperCase() + motCle.slice(1).toLowerCase();
        query = [
            "query ($genre: String, $perPage: Int) {",
            "  Page(perPage: $perPage) {",
            "    media(genre: $genre, type: ANIME, sort: SCORE_DESC) {",
            "      id title { romaji english native }",
            "      coverImage { large }",
            "      genres episodes averageScore popularity",
            "      season seasonYear",
            "      description(asHtml: false)",
            "      siteUrl",
            "    }",
            "  }",
            "}"
        ].join("\n");
        variables = { genre: nomGenre, perPage: 10 };

    } else if (type === "recherche_saison") {
        // 3. Recherche par saison
        var saison = selectSaison.value.toUpperCase(); // WINTER, SPRING, SUMMER, FALL
        var annee  = parseInt(selectAnnee.value, 10);
        query = [
            "query ($season: MediaSeason, $seasonYear: Int, $perPage: Int) {",
            "  Page(perPage: $perPage) {",
            "    media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC) {",
            "      id title { romaji english native }",
            "      coverImage { large }",
            "      genres episodes averageScore popularity",
            "      season seasonYear",
            "      description(asHtml: false)",
            "      siteUrl",
            "    }",
            "  }",
            "}"
        ].join("\n");
        variables = { season: saison, seasonYear: annee, perPage: 10 };

    } else {
        return;
    }

    envoyerRequete(query, variables);
}

function envoyerRequete(query, variables) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 30000;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState !== this.DONE) return;

        if (this.status === 0) {
            afficherMessage("Connexion impossible. Verifiez votre connexion internet.");
            return;
        }

        if (this.status === 429) {
            afficherChargement();
            setTimeout(function () { envoyerRequete(query, variables); }, 1000);
            return;
        }

        if (this.status < 200 || this.status >= 300) {
            afficherMessage("Erreur reseau (" + this.status + "). Veuillez reessayer.");
            return;
        }

        var data;
        try {
            data = JSON.parse(this.responseText);
        } catch (e) {
            afficherMessage("Reponse inattendue du serveur.");
            return;
        }

        if (data.errors) {
            var msg = data.errors.map(function (e) { return e.message; }).join(" / ");
            afficherMessage("Erreur API : " + echapper(msg));
            return;
        }

        afficherResultats(data.data.Page.media);
    });

    xhr.addEventListener("timeout", function () {
        afficherMessage("La requete a expire (30 s). Verifiez votre connexion.");
    });

    xhr.addEventListener("error", function () {
        afficherMessage("Erreur reseau. Verifiez votre connexion.");
    });

    xhr.open("POST", ANILIST_URL);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(JSON.stringify({ query: query, variables: variables }));
}

// ============================================================
//  Affichage
// ============================================================

function afficherChargement() {
    conteneurRes.innerHTML =
        '<div class="chargement" role="status">' +
        '<span class="spinner" aria-hidden="true"></span>Chargement...' +
        '</div>';
}

function afficherMessage(message) {
    conteneurRes.innerHTML = "<p>" + message + "</p>";
}

function echapper(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function afficherResultats(animes) {
    conteneurRes.innerHTML = "";

    if (!animes || animes.length === 0) {
        afficherMessage("Aucun anime trouve.");
        return;
    }

    animes.forEach(function (anime) {
        var card = document.createElement("div");
        card.className = "card";

        // Titre : anglais en priorite, sinon romaji, sinon natif
        var titre    = anime.title.english || anime.title.romaji || anime.title.native || "Titre inconnu";
        var image    = (anime.coverImage && anime.coverImage.large) ? anime.coverImage.large : "";
        var genres   = (anime.genres || []).join(", ") || "—";
        var episodes = (anime.episodes !== null && anime.episodes !== undefined) ? anime.episodes : "?";
        var score    = anime.averageScore ? (anime.averageScore / 10).toFixed(1) + " / 10" : "N/A";
        var saison   = anime.season ? (anime.season.charAt(0) + anime.season.slice(1).toLowerCase()) : "";
        var annee    = anime.seasonYear ? anime.seasonYear : "";
        var diffusion = (saison && annee) ? saison + " " + annee : annee || saison || "—";

        // Nettoyer le synopsis (l'API peut renvoyer des \n en excès)
        var synopsis = (anime.description || "Aucun synopsis disponible.")
            .replace(/\n{2,}/g, " ")
            .trim();
        var lien     = anime.siteUrl || "";

        var imgHTML = image
            ? '<img src="' + image + '" alt="' + echapper(titre) + '" width="115" height="170" loading="lazy">'
            : '<div class="no-img" aria-hidden="true"></div>';

        var lienHTML = lien
            ? '<a href="' + lien + '" target="_blank" rel="noopener noreferrer">Voir sur AniList</a>'
            : "";

        card.innerHTML =
            imgHTML +
            "<h2>" + echapper(titre)                + "</h2>" +
            "<p><strong>Genres :</strong> "          + echapper(genres)           + "</p>" +
            "<p><strong>Episodes :</strong> "        + echapper(String(episodes)) + "</p>" +
            "<p><strong>Score :</strong> "           + echapper(score)            + "</p>" +
            "<p><strong>Diffusion :</strong> "       + echapper(diffusion)        + "</p>" +
            "<p><strong>Synopsis :</strong> "        + echapper(synopsis)         + "</p>" +
            lienHTML;

        conteneurRes.appendChild(card);
    });
}
