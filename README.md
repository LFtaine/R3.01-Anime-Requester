# Anime Requester (R3.01)

Une application web permettant de rechercher des animes par titre, genre ou saison via l'API AniList (GraphQL).
Projet realise dans le cadre de la ressource **R3.01 - Developpement Web**.

**[Demo live](https://lftaine.github.io/R3.01-Anime-Requester/)**

---

## Fonctionnalites

- **Recherche par titre** - trouve un anime a partir d'un mot-cle
- **Recherche par genre** - filtre les animes selon un genre (Action, Romance, etc.)
- **Top par saison** - affiche les animes les mieux notes d'une saison et d'une annee donnees
- Affichage des fiches : titre, genres, episodes, score, synopsis et lien AniList

## Structure du projet

```
├── CSS/
│   └── style.css       # Styles de l'interface
├── JS/
│   └── script.js       # Requetes API (Fetch/GraphQL) et manipulation du DOM
├── img/                # Images de fond (slideshow)
├── favicon.png
├── index.html          # Page principale
└── README.md
```

## Technologies

| Technologie | Role |
|---|---|
| HTML5 | Structure de la page |
| CSS3 | Mise en page et theme visuel |
| JavaScript (Vanilla) | Appels API et rendu dynamique |
| [AniList GraphQL API](https://graphql.anilist.co) | Source des donnees anime |

## Utilisation

1. Clonez le depot :
   ```bash
   git clone https://github.com/lftaine/R3.01-Anime-Requester.git
   ```
2. Ouvrez `index.html` dans un navigateur (ou via *Live Server*).
3. Selectionnez un type de recherche, saisissez votre requete, et cliquez sur **Rechercher**.

## Auteurs

Louis FONTAINE · Matheo GRENECHE · Armand PIVERT · Dylan MESNAGE