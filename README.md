# Anime Requester (R3.01)

Une application web permettant de rechercher des animes par titre, genre ou saison via l'API AniList (GraphQL).
Projet réalisé dans le cadre de la ressource **R3.01 – Développement Web**.

🔗 **[Démo live](https://lftaine.github.io/R3.01-Anime-Requester/)**

---

## Fonctionnalités

- **Recherche par titre** — trouve un anime à partir d'un mot-clé
- **Recherche par genre** — filtre les animes selon un genre (Action, Romance, etc.)
- **Top par saison** — affiche les animes les mieux notés d'une saison et d'une année données
- Affichage des fiches : titre, genres, épisodes, score, synopsis et lien AniList

## Structure du projet

```
├── CSS/
│   └── style.css       # Styles de l'interface
├── JS/
│   └── script.js       # Requêtes API (Fetch/GraphQL) et manipulation du DOM
├── img/                # Images de fond (slideshow)
├── favicon.png
├── index.html          # Page principale
└── README.md
```

## Technologies

| Technologie | Rôle |
|---|---|
| HTML5 | Structure de la page |
| CSS3 | Mise en page et thème visuel |
| JavaScript (Vanilla) | Appels API et rendu dynamique |
| [AniList GraphQL API](https://graphql.anilist.co) | Source des données anime |

## Utilisation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/lftaine/R3.01-Anime-Requester.git
   ```
2. Ouvrez `index.html` dans un navigateur (ou via *Live Server*).
3. Sélectionnez un type de recherche, saisissez votre requête, et cliquez sur **Rechercher**.

> Aucune installation ni clé d'API requise — l'API AniList est publique.

## Auteurs

Louis FONTAINE · Matheo GRENECHE · Armand PIVERT · Dylan MESNAGE
