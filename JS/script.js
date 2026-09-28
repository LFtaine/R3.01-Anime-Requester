let formulaire = document.getElementById("formulaire");
formulaire.addEventListener("submit", traiterFormulaire);

let type_recherche;
let mot_cle;

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
    const data = null;

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
            console.log(this.responseText);
        }
    });

    xhr.open('GET', `https://anime-db.p.rapidapi.com/anime?genres=${mot_cle}&sortBy=ranking&sortOrder=asc`);
    xhr.setRequestHeader('x-rapidapi-key', '8bdf5aefc5msh5cdc0842b82656dp1e3d36jsnd56ae71fa5af');
    xhr.setRequestHeader('x-rapidapi-host', 'anime-db.p.rapidapi.com');

    xhr.send(data);

}