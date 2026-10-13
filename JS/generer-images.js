const fs = require("fs");

let fichiers = fs.readdirSync("img").filter(nom => /\.(webp|png|jpe?g|avif|gif)$/i.test(nom));

fs.writeFileSync("JS/images.js", "let images = " + JSON.stringify(fichiers, null, 4) + ";\n");
console.log(fichiers.length + " images trouvées");