let bande = document.querySelector(".bg-track");
let images = [];
let imagesRestantes = [];
let dernieresImages = [];
let decalage = 0;
let tempsPrecedent = 0;
let vitesse = 0.045;
let marge = 800;

lireDossier();

function lireDossier() {
    let requete = new XMLHttpRequest();

    requete.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            let page = document.createElement("div");
            page.innerHTML = this.responseText;
            let liens = page.querySelectorAll("a");

            for (let i = 0; i < liens.length; i++) {
                let morceaux = liens[i].href.split("/");
                let nom = decodeURIComponent(morceaux[morceaux.length - 1]);
                if (estUneImage(nom)) {
                    images.push(nom);
                }
            }

            if (images.length > 0) {
                demarrer();
            }
        }
    });

    requete.open("GET", "img/");
    requete.send();
}

function estUneImage(nom) {
    let extensions = [".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif"];
    for (let i = 0; i < extensions.length; i++) {
        if (nom.toLowerCase().endsWith(extensions[i])) {
            return true;
        }
    }
    return false;
}

function demarrer() {
    bande.style.animation = "none";
    ajouterImage();
    requestAnimationFrame(defiler);
}

function nomSerie(nom) {
    let debut = nom.split(".")[0];
    while (debut.length > 0 && "0123456789".includes(debut.slice(-1))) {
        debut = debut.slice(0, -1);
    }
    return debut;
}

function melanger() {
    imagesRestantes = images.slice();
    for (let i = imagesRestantes.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temporaire = imagesRestantes[i];
        imagesRestantes[i] = imagesRestantes[j];
        imagesRestantes[j] = temporaire;
    }
}

function ordreCorrect() {
    let suite = dernieresImages.concat(imagesRestantes);
    for (let i = 1; i < suite.length; i++) {
        if (nomSerie(suite[i]) === nomSerie(suite[i - 1])) {
            return false;
        }
    }
    for (let i = 0; i < 5 && i < imagesRestantes.length; i++) {
        if (dernieresImages.includes(imagesRestantes[i])) {
            return false;
        }
    }
    return true;
}

function ajouterImage() {
    if (imagesRestantes.length === 0) {
        melanger();
        let essais = 0;
        while (!ordreCorrect() && essais < 100) {
            melanger();
            essais++;
        }
    }

    let nom = imagesRestantes.shift();
    dernieresImages.push(nom);
    if (dernieresImages.length > 5) {
        dernieresImages.shift();
    }

    let image = document.createElement("img");
    image.className = "bg-slide";
    image.alt = "";
    image.src = "img/" + nom;
    image.addEventListener("load", remplirEcran);
    image.addEventListener("error", function () {
        this.remove();
    });
    bande.appendChild(image);
}

function remplirEcran() {
    let derniere = bande.lastElementChild;
    if (derniere !== null && !derniere.complete) {
        return;
    }

    let fin = 0;
    if (derniere !== null) {
        fin = derniere.offsetLeft + derniere.offsetWidth;
    }
    if (fin - decalage < window.innerWidth + marge) {
        ajouterImage();
    }
}

function defiler(temps) {
    let ecoule = temps - tempsPrecedent;
    if (ecoule > 100) {
        ecoule = 100;
    }
    decalage = decalage + ecoule * vitesse;
    tempsPrecedent = temps;

    let premiere = bande.children[0];
    let deuxieme = bande.children[1];
    if (deuxieme && premiere.offsetLeft + premiere.offsetWidth <= decalage) {
        decalage = decalage - (deuxieme.offsetLeft - premiere.offsetLeft);
        premiere.remove();
    }

    bande.style.transform = "translateX(" + (-decalage) + "px)";
    remplirEcran();
    requestAnimationFrame(defiler);
}