/* ==========================================================================
   main.js — JavaScript UNIQUE du portfolio de Francis Eboah

   CONTENU
     1. Configuration
     2. Chargement du header et du footer (components/)
     3. Lien actif dans le menu
     4. Menu mobile (hamburger)
     5. En-tête fixe (ombre + version compacte au défilement)
     6. Année automatique dans le pied de page
     7. Formulaire de service -> message WhatsApp
     8. Démarrage

   Chargé dans chaque page avec :  <script src="js/main.js" defer></script>
   ("defer" = le script attend que le HTML soit lu avant de s'exécuter)
   ========================================================================== */

"use strict"; // mode strict : signale certaines erreurs de code au lieu de les ignorer


/* ---------- 1. CONFIGURATION ----------
   Valeurs à modifier ici si elles changent. */
const CONFIG = {
    // Numéro WhatsApp au format international, sans "+" ni espaces
    whatsappNumber: "2250748746140",
    // Dossier des morceaux de page réutilisables
    componentsPath: "components/"
};


/* ---------- 2. CHARGEMENT DES COMPOSANTS ----------
   Va chercher un fichier HTML (ex. components/header.html) et l'insère
   dans l'élément de la page qui porte l'identifiant donné.
   ⚠ fetch() ne fonctionne pas si on ouvre la page par double-clic (file://).
     Il faut un serveur : extension "Live Server" de VS Code, ou
     python -m http.server, ou le site publié sur GitHub Pages. */
async function chargerComposant(idConteneur, fichier, contenuSecours) {
    const conteneur = document.getElementById(idConteneur);
    if (!conteneur) return; // la page n'a pas ce conteneur : on ne fait rien

    try {
        const reponse = await fetch(CONFIG.componentsPath + fichier);
        if (!reponse.ok) {
            throw new Error("HTTP " + reponse.status);
        }
        conteneur.innerHTML = await reponse.text();
    } catch (erreur) {
        // Échec (fichier absent, ouverture en file://, hors-ligne...) :
        // on affiche un contenu minimal pour que le site reste utilisable.
        console.error("Impossible de charger " + fichier + " :", erreur);
        conteneur.innerHTML = contenuSecours;
    }
}


/* ---------- 3. LIEN ACTIF DANS LE MENU ----------
   Compare le nom de la page courante avec chaque lien du menu.
   On retire ".html" pour que ça marche aussi avec l'URL "/about". */
function marquerLienActif() {
    const pageCourante = (window.location.pathname.split("/").pop() || "index")
        .replace(".html", "");

    document.querySelectorAll(".nav-links a").forEach(function (lien) {
        const cible = lien.getAttribute("href").replace(".html", "");
        if (cible === pageCourante) {
            lien.classList.add("active");
            lien.setAttribute("aria-current", "page");
        }
    });
}


/* ---------- 4. MENU MOBILE ----------
   Le bouton ☰ ajoute / retire la classe "open" sur la liste des liens.
   Le CSS (style.css, section 10) affiche ou cache le menu selon cette classe.
   Le menu se referme aussi : au clic sur un lien, au clic en dehors de
   l'en-tête, avec la touche Échap, et quand on repasse en affichage large.
   ⚠ À appeler APRÈS le chargement du header, sinon le bouton n'existe pas encore. */
function initialiserMenuMobile() {
    const entete = document.getElementById("site-header");
    const bouton = document.querySelector(".menu-toggle");
    const liens = document.querySelector(".nav-links");
    if (!entete || !bouton || !liens) return;

    // Ouvre (true) ou ferme (false) le menu et synchronise le bouton
    function definirEtat(ouvert) {
        liens.classList.toggle("open", ouvert);
        bouton.setAttribute("aria-expanded", String(ouvert));
        bouton.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
        bouton.textContent = ouvert ? "✕" : "☰";
    }

    bouton.addEventListener("click", function () {
        definirEtat(!liens.classList.contains("open"));
    });

    // Clic sur un lien du menu -> on referme
    liens.addEventListener("click", function (evenement) {
        if (evenement.target.closest("a")) definirEtat(false);
    });

    // Clic ailleurs dans la page -> on referme
    document.addEventListener("click", function (evenement) {
        if (!entete.contains(evenement.target)) definirEtat(false);
    });

    // Touche Échap -> on referme
    document.addEventListener("keydown", function (evenement) {
        if (evenement.key === "Escape") definirEtat(false);
    });

    // Passage en affichage large (rotation du téléphone, PC...) -> on referme
    window.matchMedia("(min-width: 701px)").addEventListener("change", function () {
        definirEtat(false);
    });
}


/* ---------- 5. EN-TÊTE FIXE ----------
   Le positionnement fixe est fait en CSS (position: sticky).
   Ici, on ajoute la classe "scrolled" dès qu'on a défilé de quelques pixels :
   le CSS en fait une version plus compacte avec une ombre. */
function initialiserEnteteFixe() {
    const entete = document.getElementById("site-header");
    if (!entete) return;

    function mettreAJour() {
        entete.classList.toggle("scrolled", window.scrollY > 10);
    }

    // { passive: true } : indique au navigateur que le défilement ne sera pas
    // bloqué par ce code -> défilement plus fluide sur téléphone
    window.addEventListener("scroll", mettreAJour, { passive: true });
    mettreAJour(); // état correct dès le chargement (page rechargée en bas)
}


/* ---------- 6. ANNÉE AUTOMATIQUE ---------- */
function mettreAJourAnnee() {
    const annee = document.getElementById("annee");
    if (annee) annee.textContent = new Date().getFullYear();
}


/* ---------- 7. FORMULAIRE DE SERVICE -> WHATSAPP ----------
   Présent uniquement dans contact.html (id="form-service").
   Au clic sur "Envoyer", on construit un message structuré
   et on ouvre WhatsApp avec ce message déjà écrit.
   Aucun serveur n'est nécessaire : rien n'est stocké, le visiteur
   envoie lui-même le message depuis son WhatsApp. */
function initialiserFormulaireService() {
    const formulaire = document.getElementById("form-service");
    if (!formulaire) return; // autres pages : pas de formulaire

    formulaire.addEventListener("submit", function (evenement) {
        evenement.preventDefault(); // empêche le rechargement de la page

        // Affiche les messages de validation du navigateur (champs obligatoires)
        if (!formulaire.reportValidity()) return;

        const donnees = new FormData(formulaire);
        const nom = donnees.get("nom").trim();
        const service = donnees.get("service");
        const message = donnees.get("message").trim();

        // Message structuré (chaque élément de la liste = une ligne)
        const lignes = [
            "Bonjour Francis,",
            "",
            "Je souhaite faire une demande de service.",
            "",
            "• Nom : " + nom,
            "• Service : " + service,
            "• Détails : " + message
        ];

        // encodeURIComponent : transforme les accents, espaces et retours à la
        // ligne en caractères sûrs pour une adresse web
        const adresse = "https://wa.me/" + CONFIG.whatsappNumber +
            "?text=" + encodeURIComponent(lignes.join("\n"));

        window.open(adresse, "_blank", "noopener");
    });
}


/* ---------- 8. DÉMARRAGE ----------
   Ordre important : on charge d'abord header et footer, PUIS on active
   ce qui dépend d'eux (lien actif, menu mobile, année). */
async function demarrer() {
    await Promise.all([
        chargerComposant(
            "site-header",
            "header.html",
            '<nav class="navbar"><a href="index.html" class="logo">Francis Eboah</a></nav>'
        ),
        chargerComposant(
            "site-footer",
            "footer.html",
            '<div class="footer-bottom"><p>© Francis Eboah — Tous droits réservés.</p></div>'
        )
    ]);

    marquerLienActif();
    initialiserMenuMobile();
    initialiserEnteteFixe();
    mettreAJourAnnee();
    initialiserFormulaireService();
}

demarrer();

