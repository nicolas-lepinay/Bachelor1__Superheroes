    // DÉCLARATIONS DES VARIABLES GLOBALES :

    const searchInput = document.getElementById("searchbar"); // Barre de recherche
    const results = document.getElementById("results"); // Contenu du tableau

    let heroes;
    let searchTerm = ""; // Terme recherché par l'utilisateur dans la barre de recherche

    let start = 0; // Indice du premier personnage à imprimer
    let n = 20; // Nombre de résultats par page (indice+1 du dernier personnage à imprimer) ("20" par défaut)

    let field = "name"; // Champ de recherche sélectionné ("name" par défaut)
    let radio = "included"; // Option de radio sélectionnée ("included" par défaut)
    let radio2 = "equal";

    // API REQUEST :

    async function fetchData() {
        heroes = await fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json")
            .then(response => response.json());
    };

    // FONCTION D'IMPRESSION DU TABLEAU :

    async function showHeroes() {
        await fetchData();

        // Cas où la radio 'Included' est cochée :
        if (radio == "included") { results.innerHTML = (heroes.filter(searchByField).map(addHero).join("")); }

        // Cas où la radio 'Excluded' est cochée :
        else {
            results.innerHTML = (heroes.filter(hero => !searchByField(hero)).map(addHero).join("")); // ⚠️ Cette fois, nécessite de mentionner une variable 'hero', car écrire (!searchByField) tout seul ne fonctionne pas.
        }

        // Si le résultat obtenu est un tableau vide, j'affiche "No result was found" et un bouton pour rafraîchir la page :
        if (results.innerHTML == "") {
            results.innerHTML = `

        <tr class="empty-line">
            <td colspan="15"></td>
        </tr>

        <tr class="empty-line">
            <td colspan="15" ><br>NO RESULT WAS FOUND<br><div class="search-again" onclick="location.reload();">❮ SEARCH AGAIN ❯</div><br></td>
        </tr>

        <tr class="empty-line">
            <td colspan="15"></td>
        </tr>

        `;
        }


        // Déclarations de ma fonction de recherche par champ :

        //-----------------------------------------//⭐\\-----------------------------------------//

        function searchByField(hero) {

            let fields = field.split(".");
            let field1 = fields[0];
            let field2 = fields[1];

            // Si le champ est "Name" :
            // Trouve tous les héros dont le nom inclut les lettres tapées par l'utilisateur.
            if (field == "name") { return hero.name.toLowerCase().includes(searchTerm.toLowerCase()) }


            // Si le champ est "Gender" :
            // Trouve tous les héros dont le genre COMMENCE PAR la lettre / le texte tapé par l'utilisateur.
            if (field == "appearance.gender") {
                if (hero.appearance.gender == '-') { hero.appearance.gender = "?" }
                return hero.appearance.gender.toLowerCase().startsWith(searchTerm.toLowerCase());
            }

            // Si le champ est l'un des Powerstats :
            // Trouve les héros dont la stat est égale au nombre recherché par l'utilisateur.

            if (field.includes("powerstats")) {

                if (radio2 == "equal") { return hero.powerstats[field2] == searchTerm; }
                if (radio2 == "greater") { return hero.powerstats[field2] > searchTerm; }
                if (radio2 == "less") { return hero.powerstats[field2] < searchTerm; }
            }

            // Si c'est un autre champ quelconque (sauf 'ANY') :
            if (field != "any") {
                if (hero.appearance.race == null) { hero.appearance.race = "❔" }; // ⚠️ Obligatoire pour que le code fonctionne, car il ne peut pas traiter les valeurs null.
                if (hero.appearance.gender == '-') { hero.appearance.gender = "?" }; // // Les personnages ni homme ni femme peuvent être recherchés en tapant un '?'. 
                return hero[field1][field2].toLowerCase().includes(searchTerm.toLowerCase())
            }

            // Sinon, si le champ 'ANY' :
            if (hero.appearance.race == null) { hero.appearance.race = "❔" }; // ⚠️ Obligatoire

            return hero.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hero.biography.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hero.appearance.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hero.powerstats.intelligence == searchTerm ||
                hero.powerstats.strength == searchTerm ||
                hero.powerstats.speed == searchTerm ||
                hero.powerstats.power == searchTerm ||
                hero.powerstats.durability == searchTerm ||
                hero.powerstats.combat == searchTerm ||
                hero.appearance.gender.toLowerCase() == searchTerm.toLowerCase() || // Je mets une égalité pour éviter qu'une recherche avec "MALE" renvoie à la fois les résultats "MALE" et "feMALE".
                hero.biography.placeOfBirth.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hero.biography.alignment.toLowerCase().includes(searchTerm.toLowerCase());
        }

        //-----------------------------------------\\⭐//-----------------------------------------//


        // Fonction d'impression du tableau sur 1 page :
        function addHero(hero, index) {

            while (start <= index && index < start + n) {

                // Je ne garde que les kilogrammes pour le poids :
                const weightRegex = /[0-9]*\skg/gi;
                if (hero.appearance.weight.toString().match(weightRegex) == null || hero.appearance.weight.toString().match(weightRegex) == "0 kg") {
                    hero.appearance.weight = "❔"
                } else {
                    hero.appearance.weight = hero.appearance.weight.toString().match(weightRegex)
                }

                // Les poids à 2 chiffres (ex: '14 kg', c-à-d 5 caractères en tout) doivent être précédés d'un '0' pour que le tri fonctionne correctement.
                if ((hero.appearance.weight).toString().length == 5) { hero.appearance.weight = '0' + hero.appearance.weight }

                // Je ne garde que les centimètres pour la taille :
                const heightRegex = /[0-9]*\scm/gi;
                if (hero.appearance.height.toString().match(heightRegex) == null || hero.appearance.height.toString().match(heightRegex) == "0 cm") {
                    hero.appearance.height = "❔"
                } else {
                    hero.appearance.height = hero.appearance.height.toString().match(heightRegex)
                }
                // Les tailles à 2 chiffres (ex: '77 cm', c-à-d 5 caractères en tout) doivent être précédées d'un '0' pour que le tri fonctionne correctement.
                if ((hero.appearance.height).toString().length == 5) { hero.appearance.height = '0' + hero.appearance.height }


                // Je remplace les valeurs non-renseignées par des "?" :
                if (hero.biography.fullName == "") { hero.biography.fullName = "❔" };
                if (hero.appearance.race == null) { hero.appearance.race = "❔" };
                if (hero.appearance.gender == '-' || hero.appearance.gender == '?') { hero.appearance.gender = "❔" };
                if (hero.appearance.height.includes('-')) { hero.appearance.height = "❔" };
                if (hero.appearance.weight.includes('-')) { hero.appearance.weight = "❔" };
                if (hero.biography.placeOfBirth == "-" || hero.biography.placeOfBirth == "Place of birth unknown") { hero.biography.placeOfBirth = "❔" };
                if (hero.biography.alignment == "-") { hero.biography.alignment = "❔" };

                return `
                <tr>
                    <td><a onclick="updatePopup(${hero.id}); togglePopup();" target="_blank">
                            <img class="hero-pic" src="${hero.images.sm}" alt="${hero.name}" title="Click me 📜">
                        </a>
                    </td>
                    <td class="hero-name">${hero.name}</td>
                    <td class="hero-fullname">${hero.biography.fullName}</td>
                    <td class="hero-race">${hero.appearance.race}</td>
                    <td class="hero-gender">${hero.appearance.gender}</td>
                    <td class="hero-height">${hero.appearance.height}</td>
                    <td class="hero-weight">${hero.appearance.weight}</td>
                    <td class="hero-birthplace">${hero.biography.placeOfBirth}</td>
                    <td class="hero-alignment">${hero.biography.alignment}</td>
                    <td class="hero-powerstats" title="🧠 INTELLIGENCE">${hero.powerstats.intelligence}</td>
                    <td class="hero-powerstats" title="💪 STRENGTH">${hero.powerstats.strength}</td>
                    <td class="hero-powerstats" title="💨 SPEED">${hero.powerstats.speed}</td>
                    <td class="hero-powerstats" title="💥 POWER">${hero.powerstats.power}</td>
                    <td class="hero-powerstats" title="⏳ DURABILITY">${hero.powerstats.durability}</td>
                    <td class="hero-powerstats" title="⚔️ COMBAT">${hero.powerstats.combat}</td>
                </tr>
                `
            }
        };
    }



    // ON GÉNERE LE TABLEAU UNE PREMIERE FOIS (20 résultats) :

    showHeroes();



    // JE STOCKE LE TEXTE RECHERCHÉ PAR L'UTILISATEUR DANS LA VARIABLE searchTerm :

    searchInput.addEventListener("input", (e) => {
        searchTerm = e.target.value;
        start = 0;
        showHeroes();
    });

    // NOMBRE D'ÉLÉMENTS PAR PAGE :

    let numberSelector = document.getElementById("number-list");
    numberSelector.addEventListener("change", function(event) {
        n = parseInt(event.target.value); // Équivalent à : n = parseInt(this.value); On pourra alors se passer de l'argument 'event'.
        start = 0;
        showHeroes();
    })

    // CHAMP DE RECHERCHE SÉLECTIONNÉ :

    let fieldSelector = document.getElementById("field-list");
    let radioEqual = document.getElementById("radioEqual");

    fieldSelector.addEventListener("change", function(event) {
        field = event.target.value;
        showHeroes();

        if (field.includes("powerstats")) {
            radioEqual.style.display = "block";
        } else {
            radioEqual.style.display = "none";
        }
    })


    // VÉRIFIE SI LA RADIO COCHÉE EST 'INCLUDED' OU 'EXCLUDED' ET MET A JOUR LA VARIABLE 'radio' EN CONSÉQUENCE :

    function toggleRadio() {
        let included = document.getElementById("included-radio");
        //let excluded = document.getElementById("excluded-radio");

        if (included.checked == true) { radio = "included" } else { radio = "excluded" };
        //if (excluded.checked == true) { radio = "excluded" } else { radio = "included" };
    }


    // VÉRIFIE SI LA 2EME RADIO COCHÉE EST 'EQUAL TO...' OU 'GREATER THAN...' OU 'LESS THAN...' ET MET A JOUR LA VARIABLE 'radio2' EN CONSÉQUENCE :

    function toggleRadio2() {
        let equalRadio = document.getElementById("equal-radio");
        let greaterRadio = document.getElementById("greater-radio");
        let lessRadio = document.getElementById("less-radio");

        if (equalRadio.checked == true) { radio2 = "equal" };
        if (greaterRadio.checked == true) { radio2 = "greater" };
        if (lessRadio.checked == true) { radio2 = "less" };
    }


    // PASSER A LA PAGE SUIVANTE :

    const buttonNext = document.querySelector("#btn-nextpage");

    buttonNext.addEventListener("click", AddNew);

    function AddNew() {
        start += n;
        showHeroes();
    }

    // REVENIR A LA PAGE PRÉCÉDENTE :

    const buttonPrevious = document.querySelector("#btn-previouspage");

    buttonPrevious.addEventListener("click", goBack);

    function goBack() {
        start -= n;
        showHeroes();
    }


    // AJOUTER DU CONTENU DANS LA POP-UP 'DETAILED CARD' :

    async function updatePopup(id) {

        heroes = await fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json").then(response => response.json());

        // Je prends la liste de tous les héros, et je choisis (filtre) uniquement celui dont l'identifiant est égal à l'id passé en argument de la fonction :
        let hero = heroes.filter(hero => hero.id == id)[0];

        // Remplacement des valeurs vides par des "❔" :
        if (hero.appearance.race == null) { hero.appearance.race = "❔" };
        if (hero.appearance.eyeColor == "-") { hero.appearance.eyeColor = "❔" };
        if (hero.appearance.hairColor == "-") { hero.appearance.hairColor = "❔" };
        if (hero.work.occupation == "-") { hero.work.occupation = "❔" };
        if (hero.work.base == "-") { hero.work.base = "❔" };
        if (hero.connections.groupAffiliation == "-") { hero.connections.groupAffiliation = "❔" };
        if (hero.connections.relatives == "-") { hero.connections.relatives = "❔" };

        // Troncation des valeurs trop longues ( > 250 caractères):
        if ((hero.connections.groupAffiliation).length > 250) { hero.connections.groupAffiliation = hero.connections.groupAffiliation.substr(0, 250) + "[...]" };
        if ((hero.connections.relatives).length > 300) { hero.connections.relatives = hero.connections.relatives.substr(0, 300) + "[...]" };

        // Calcul de l'average score :
        let averageScore = (((Object.values(hero.powerstats).reduce((a, b) => a + b, 0)) / 6) / 10).toFixed(1);

        // Modification de l'image :
        document.querySelector("#popup-pic").src = hero.images.sm;

        // Modification du full name :
        document.querySelector("#popup-fullname").innerHTML = hero.biography.fullName;

        // Modification du name :
        document.querySelector("#popup-name").innerHTML = hero.name;

        // Ajout de la description :
        document.querySelector("#popup-description").innerHTML = `<p style="font-weight:bold">Average skill score: <span style="color:red">${averageScore} /10</span></p><br>`;
        document.querySelector("#popup-description").innerHTML += `<p style="text-align:left"><span style="color:red">❯</span>
        Species: ${hero.appearance.race}</p>`;
        document.querySelector("#popup-description").innerHTML += `<p style="text-align:left"><span style="color:red">❯</span>
        Eye color: ${hero.appearance.eyeColor}</p>`;
        document.querySelector("#popup-description").innerHTML += `<p style="text-align:left"><span style="color:red">❯</span>
        Hair color: ${hero.appearance.hairColor}</p>`;
        document.querySelector("#popup-description").innerHTML += `<p style="text-align:left"><span style="color:red">❯</span>
        Occupation: ${hero.work.occupation}</p>`;
        document.querySelector("#popup-description").innerHTML += `<p style="text-align:left"><span style="color:red">❯</span>
        Base: ${hero.work.base}</p>`;
        document.querySelector("#popup-description").innerHTML += `<p style="text-align:left"><span style="color:red">❯</span>
        Squad: ${hero.connections.groupAffiliation}</p>`;
        document.querySelector("#popup-description").innerHTML += `<p style="text-align:left"><span style="color:red">❯</span>
        Relatives: ${hero.connections.relatives}</p><br>`;
        document.querySelector("#popup-description").innerHTML += `<p>📜 For more information: <a href="https://fr.wikipedia.org/wiki/${hero.name}" target="_blank">click this link</p>`;

    }


    // OUVRIR LA POP-UP 'DETAILED CARD' :

    async function togglePopup() {

        document.getElementById("popup-1").classList.toggle("active");
    }