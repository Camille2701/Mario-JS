// système de recommandation qui conseille le bon film en fonction de l'âge de l'utilisateur

const birthday = prompt("Quel est votre age ?");

if (birthday < 13) console.log("Lilo et Stitch");
if (birthday > 60) console.log("ben Hur");
if (birthday >= 13 && birthday <= 60) console.log("Matrix");