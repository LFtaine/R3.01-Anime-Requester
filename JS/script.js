let formulaire = document.getElementById("formulaire");
formulaire.addEventListener("submit", traiterFormulaire);

let type_recherche;
let mot_cle;
let resultat;

function traiterFormulaire(event) {
    event.preventDefault();


    type_recherche = document.getElementById("type_recherche").value;
    mot_cle = document.getElementById("mot_cle").value;
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
            resultat=JSON.parse(this.responseText);
            console.log("Résultat de la requête : ", resultat);
        }
    });

    if(type_recherche === "recherche_genre") {
        xhr.open('GET', `https://anime-db.p.rapidapi.com/anime?page=1&size=10&genres=${mot_cle}&sortBy=ranking&sortOrder=asc`);
    }
    else{
        xhr.open('GET', `https://anime-db.p.rapidapi.com/anime?page=1&size=10&search=${mot_cle}&sortBy=ranking&sortOrder=asc`);
    }
    xhr.setRequestHeader('x-rapidapi-key', '9e5903b096mshc6296e5f055eb5bp152ce7jsn26bd612daa06');
    xhr.setRequestHeader('x-rapidapi-host', 'anime-db.p.rapidapi.com');

    xhr.send();

    

}