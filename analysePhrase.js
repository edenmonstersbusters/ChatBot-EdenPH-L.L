//Salut
//Bon le programme est pas très précis mais ce sont ses premiers pas donc il faut pas lui en vouloir (;
//Dédicace spéciale à Copilot pour le système d'API (;
//PetiteNature = indications de Wikipédia dictionnaire
//GrandeNature = déduction finale de la nature après l'attribution des fonctions 
//Pour la réponse "|" veut dire "ou" 
//L'autre programme c'est un théorème que ChatGPT m'a craché et que j'utilisais pour L.L bot
// Sinon t'as vu comment ce programme il est propre et super bien organisé ?!?


var phrase = input("Entrez une phrase : ");
var decoupage = phrase.toLowerCase().replace(/[.,!?]/g, " ").split(/ |'/);
var tableau = [];
var compteur = 0;

for (let i = 0; i < decoupage.length; i++) {
    Nature(decoupage[i], i);
}

function Nature(mot, index){

    fetch("https://fr.wiktionary.org/w/api.php?action=parse&page=" + mot + "&prop=wikitext&format=json&origin=*")
      .then(r => r.json())
      .then(data => {

        var texte = data.parse?.wikitext?.["*"];

        if (!texte || !texte.includes("== {{langue|fr}} ==")) {
            tableau[index] = { mot: mot, PetiteNature: "pas français", fonction: "pas français" };
            compteur++;
            if (compteur == decoupage.length) Fonction();
            return;
        }

        var frSection = texte.split("== {{langue|fr}} ==")[1].split("== {{langue|")[0].toLowerCase();
        let PetiteNature="";

        
            if (frSection.includes("{{s|nom")) {FastCheck();PetiteNature += "nom";}
            if (frSection.includes("{{s|article")) { FastCheck(); PetiteNature += "article"; }
            if (frSection.includes("{{s|interjection")) {FastCheck();PetiteNature += "interjection";}
            if (frSection.includes("{{s|onomatopée")) {FastCheck();PetiteNature += "onomatopée";}
            if (frSection.includes("{{s|adjectif")) { FastCheck();PetiteNature += "adjectif";}
            if (frSection.includes("{{s|adverbe")) { FastCheck();PetiteNature += "adverbe";}
            if (frSection.includes("{{s|pronom")) { FastCheck();PetiteNature += "pronom";}
            if (frSection.includes("{{s|préposition")) { FastCheck();PetiteNature += "préposition";}
            if (frSection.includes("{{s|conjonction")) { FastCheck();PetiteNature += "conjonction";}
            if (frSection.includes("{{s|symbole")) { FastCheck();PetiteNature += "symbole";}
            if (frSection.includes("{{s|lettre")) { FastCheck();PetiteNature += "lettre";}
            if (frSection.includes("{{s|ponctuation")) { FastCheck();PetiteNature += "ponctuation";}
            if (frSection.includes("{{s|déterminant")) { FastCheck();PetiteNature += "déterminant";}
            if (frSection.includes("{{s|numéral")) { FastCheck(); PetiteNature += "numéral"; }
            if (frSection.includes("{{s|nombre")) { FastCheck(); PetiteNature += "nombre"; }
            if (frSection.includes("{{s|particule")) { FastCheck(); PetiteNature += "particule"; }
            if (frSection.includes("{{s|verbe")) { FastCheck();PetiteNature += "verbe";}
            if (PetiteNature == ""){PetiteNature = "inconnue";}

            function FastCheck() {
                if (PetiteNature != "") {
                    PetiteNature+=" | ";
                }
            }
        
        tableau[index] = { mot: mot, PetiteNature: PetiteNature, GrandeNature: PetiteNature , fonction: "inconnue" };

        compteur++
       if (compteur == decoupage.length) Fonction();
      });
}

function Fonction() {

    let dernierVerbe = -1;
    let dernierAuxiliaire = -1;

    for (let i = 0; i < tableau.length; i++) {

        let mot = tableau[i].mot;
        let PetiteNature = tableau[i].PetiteNature;
        const auxiliaires = ["ai","as","a","avons","avez","ont","étais","était","étions","étiez","étaient","suis","es","est","sommes","êtes","sont"];
        
         
        //COI
        if (["nom","pronom","préposition"].some(x => PetiteNature.includes(x))) {

            
            if (i > 0 && tableau[i-1].GrandeNature.includes("préposition")) {
                tableau[i].fonction = "COI";
                continue;
            }

            else if (i < tableau.length-1&&PetiteNature.includes("préposition")&&(tableau[i+1].PetiteNature.includes("nom")||tableau[i+1].PetiteNature.includes("pronom"))) {
                tableau[i].fonction = "COI";
                continue;
            }
        }

        //COD
        if (["nom","déterminant","adjectif","article",].some(x => PetiteNature.includes(x))) {

            if ((dernierVerbe !== -1 && tableau[dernierVerbe].fonction === "verbe conjugué")||(dernierAuxiliaire !== -1 && i > dernierAuxiliaire)) {
                tableau[i].fonction = "COD | attribut du sujet";
                tableau[i].GrandeNature = PetiteNature.replace(/\b(verbe)\b/g, "");
                continue;
            }
        }


        //Verbes
        if (PetiteNature.includes(" verbe")) {
        console.log(tableau[i].PetiteNature);
            let PetitPlus = "";

            if (["er","ir","dre","oir","ure","ire"].some(s => mot.endsWith(s))) {
                PetitPlus = "infinitif";
            }
            else if (["é","ée","és","ées"].some(s => mot.endsWith(s))) {
                //En vrai ça peut que pour les verbes du premier groupe, je viens de me rendre compte...
                PetitPlus = "participe passé";
            }
            else {
                PetitPlus = "conjugué";
            }

            tableau[i].fonction = "verbe " + PetitPlus;

            if (PetitPlus === "conjugué") {
                dernierVerbe = i;
            }

        //Auxiliaires
        if (auxiliaires==mot) {
            tableau[i].fonction += tableau[i].fonction=="" ? "auxiliaire" : " ou auxiliaire";
            dernierAuxiliaire = i;
        }
        tableau[i].GrandeNature = "verbe";
        continue;    
        }

        //Sujet
        if (PetiteNature.includes("pronom") || PetiteNature.includes("nom")) {
            if (dernierVerbe === -1 && dernierAuxiliaire === -1) {
                tableau[i].fonction = "sujet";
                continue;
            }
        }

        //Adjectif
        if (PetiteNature.includes("adjectif")) {
            tableau[i].fonction = "adjectif épithète";
            continue;
        }

    }

    console.log(tableau);
}

//Et voilà Lucien c le goaaaaat (2 eurossssssssssss)

//Maintenant les problèmes (si t'en trouves de nouveaux tu peux les noter pour que je les corrige plus tard) : 
// 1) Wikipédia se plante souvent sur la nature psk y a souvent bcp d'homonymes donc par exemple pour "président", il peut le prendre pour le verbe présider à la troisième personne du pluriel et  après la partie Fonction dit donc que c'est un verbe
// 2) COS, CCL, CCM, CCT ect.. pas integrés : trop compliqué!!
// 3) Rien d'autre pour l'instant je crois, mais je suis sûr que t'en trouveras d'autres en testant le programme (; (je te fais confiance pour ça)