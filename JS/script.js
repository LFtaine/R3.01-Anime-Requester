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

}