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
     8. Formulaires de formation -> message WhatsApp (formations.html)
     9. Favicon (icône de l'onglet)
     10. Démarrage

   Chargé dans chaque page avec :  <script src="js/main.js" defer></script>
   ("defer" = le script attend que le HTML soit lu avant de s'exécuter)
   ========================================================================== */

"use strict"; // mode strict : signale certaines erreurs de code au lieu de les ignorer


/* ---------- 1. CONFIGURATION ----------
   Valeurs à modifier ici si elles changent. */
const CONFIG = {
    // Numéro WhatsApp au format international, sans "+" ni espaces
    whatsappNumber: "2250748746140",
    // Identifiant du compte marchand Wave (page formations.html, section 8)
    waveMarchand: "M_ci_eHBwfy2zeGi-",
    // Lien du groupe WhatsApp de la communauté EDC (repris dans les messages
    // de formations.html, section 8, et le bouton du pied de page)
    lienCommunaute: "https://chat.whatsapp.com/JefwyV0An08DUR2MvyoDQ3",
    // Dossier des morceaux de page réutilisables
    componentsPath: "components/",
    // Icône affichée dans l'onglet du navigateur
    faviconPath: "assets/favicon.svg"
};


/* ---------- 1bis. CONFIGURATION PWA (application installable) ----------
   Regroupé ici pour rester facile à retrouver / modifier d'un bloc. */
const CONFIG_PWA = {
    manifestPath: "manifest.json",
    serviceWorkerPath: "sw.js",
    themeColor: "#000f6e",           // bleu foncé du logo EDC (identique à manifest.json)
    appleTouchIcon: "assets/apple-touch-icon.png",
    nomAffiche: "EDC"                // nom court sous l'icône une fois installée
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

    // Même logique pour le menu du haut ET la barre du bas (ils partagent
    // le même système de pastille/couleur "active", voir style.css).
    document.querySelectorAll(".nav-links a, .bottom-nav a").forEach(function (lien) {
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

    // Présélection du service si l'adresse contient ?service=...
    // (boutons "Demander ce service" de services.html)
    const liste = formulaire.elements["service"];
    const demande = new URLSearchParams(window.location.search).get("service");
    if (demande && Array.from(liste.options).some(function (option) {
        return option.value === demande;
    })) {
        liste.value = demande;
    }

    formulaire.addEventListener("submit", function (evenement) {
        evenement.preventDefault(); // empêche le rechargement de la page

        // Affiche les messages de validation du navigateur (champs obligatoires)
        if (!formulaire.reportValidity()) return;

        const donnees = new FormData(formulaire);
        const nom = donnees.get("nom").trim();
        // Texte affiché de l'option choisie (et non sa clé courte)
        const service = liste.options[liste.selectedIndex].text.trim();
        const mode = donnees.get("mode");
        const message = donnees.get("message").trim();

        // Message structuré (chaque élément de la liste = une ligne)
        const lignes = [
            "Bonjour Francis,",
            "",
            "Je souhaite faire une demande de service.",
            "",
            "• Nom : " + nom,
            "• Service : " + service,
            "• Mode : " + mode,
            "• Détails : " + message
        ];

        // encodeURIComponent : transforme les accents, espaces et retours à la
        // ligne en caractères sûrs pour une adresse web
        const adresse = "https://wa.me/" + CONFIG.whatsappNumber +
            "?text=" + encodeURIComponent(lignes.join("\n"));

        window.open(adresse, "_blank", "noopener");
    });
}


/* ---------- 8. FORMULAIRE DE FORMATION -> WHATSAPP ----------
   Présent uniquement dans formations.html. Même principe que le formulaire
   de service (section 7) : aucun serveur, le visiteur envoie lui-même le
   message depuis son propre WhatsApp.

   LIEN DE PAIEMENT WAVE
   Le lien Wave accepte un montant dans son adresse (...?amount=2020).
   CONFIG.lienWave(montant) reconstruit ce lien pour n'importe quel montant,
   sans dupliquer l'adresse à chaque endroit du code. Si l'identifiant
   marchand Wave change un jour, il suffit de le modifier UNE SEULE FOIS
   dans CONFIG.waveMarchand (section 1). */
function lienWave(montant) {
    return "https://pay.wave.com/m/" + CONFIG.waveMarchand + "/c/ci/?amount=" + montant;
}

// --- Formulaire unique : une ou plusieurs formations (cases à cocher) ---
// Prix total = inscription (une seule fois) + formation × nombre de cases
// cochées. Un seul lien Wave est envoyé, pour le montant total à régler.
function initialiserFormulaireFormations() {
    const formulaire = document.getElementById("form-formations");
    if (!formulaire) return; // autres pages : pas de formulaire

    const montantInscription = Number(formulaire.dataset.montantInscription); // 5050
    const montantFormation = Number(formulaire.dataset.montantFormation);     // 10100
    const erreurFormations = document.getElementById("form-erreur-formations");

    // Met en évidence (bordure bleue) la carte d'une formation quand sa
    // case est cochée. Fait en JS plutôt qu'en CSS pur (:has) pour rester
    // compatible avec les anciens navigateurs/téléphones.
    formulaire.querySelectorAll('input[name="formation"]').forEach(function (case_) {
        case_.addEventListener("change", function () {
            const carte = case_.closest(".formation-item");
            if (carte) carte.classList.toggle("est-cochee", case_.checked);
        });
    });

    formulaire.addEventListener("submit", function (evenement) {
        evenement.preventDefault();

        // Les cases à cocher ne sont pas vérifiables par "required" du
        // navigateur (chacune est indépendante) : on vérifie nous-mêmes
        // qu'au moins une est cochée avant de valider le reste du formulaire.
        const formationsCochees = formulaire.querySelectorAll('input[name="formation"]:checked');
        if (formationsCochees.length === 0) {
            erreurFormations.hidden = false;
            return;
        }
        erreurFormations.hidden = true;

        if (!formulaire.reportValidity()) return;

        const donnees = new FormData(formulaire);
        const mode = donnees.get("mode");
        const nom = donnees.get("nom").trim();
        const whatsapp = donnees.get("whatsapp").trim();
        const formations = Array.from(formationsCochees).map(function (c) { return c.value; }).join(", ");

        const montantTotal = montantInscription + (formationsCochees.length * montantFormation);

        // Message rédigé en phrases (4 paragraphes), plutôt qu'en liste à puces.
        const paragraphes = [
            "Bonjour Francis,",
            "Je souhaite m'inscrire à la/aux formation(s) suivante(s) : " +
                formations + " (" + mode + "). Je m'appelle " + nom +
                " et vous pouvez me joindre sur WhatsApp au " + whatsapp + ".",
            "Le montant total à régler est de " + montantTotal + " FCFA " +
                "(inscription + formation(s) choisie(s), frais de transaction " +
                "inclus), que je peux payer via ce lien : " + lienWave(montantTotal) +
                ". Je vous envoie la capture d'écran du paiement juste après.",
            "Je rejoins aussi la communauté EDC sur WhatsApp : " + CONFIG.lienCommunaute + "."
        ];

        const adresse = "https://wa.me/" + CONFIG.whatsappNumber +
            "?text=" + encodeURIComponent(paragraphes.join("\n\n"));

        window.open(adresse, "_blank", "noopener");
    });
}


/* ---------- 8bis. BARRE DE NAVIGATION DU BAS (style application) ----------
   Contrairement au header/footer, aucune page ne contient de conteneur pour
   elle : on la charge et on l'ajoute nous-mêmes en fin de <body>. Cachée sur
   ordinateur, visible seulement sur téléphone (voir style.css, section 10). */
async function chargerBarreDuBas() {
    try {
        const reponse = await fetch(CONFIG.componentsPath + "bottom-nav.html");
        if (!reponse.ok) throw new Error("HTTP " + reponse.status);
        const conteneur = document.createElement("div");
        conteneur.innerHTML = await reponse.text();
        document.body.appendChild(conteneur.firstElementChild);
    } catch (erreur) {
        console.error("Impossible de charger bottom-nav.html :", erreur);
    }
}


/* ---------- 8ter. APPLICATION INSTALLABLE (PWA) ----------
   Ajoute les balises nécessaires pour que le site puisse être installé
   comme une application (icône sur l'écran d'accueil, plein écran, sans
   barre d'adresse). Rien ne change pour un visiteur qui reste dans son
   navigateur : ces balises ne font qu'activer la fonctionnalité. */
function ajouterBalisesPwa() {
    const balises = [
        { tag: "link", rel: "manifest", href: CONFIG_PWA.manifestPath },
        { tag: "link", rel: "apple-touch-icon", href: CONFIG_PWA.appleTouchIcon },
        { tag: "meta", name: "theme-color", content: CONFIG_PWA.themeColor },
        { tag: "meta", name: "apple-mobile-web-app-capable", content: "yes" },
        { tag: "meta", name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { tag: "meta", name: "apple-mobile-web-app-title", content: CONFIG_PWA.nomAffiche }
    ];

    balises.forEach(function (info) {
        const element = document.createElement(info.tag);
        if (info.rel) element.rel = info.rel;
        if (info.href) element.href = info.href;
        if (info.name) element.name = info.name;
        if (info.content) element.content = info.content;
        document.head.appendChild(element);
    });
}

// Le service worker est ce qui autorise techniquement l'installation
// (condition exigée par Android/Chrome) et permet l'ouverture hors-ligne.
function enregistrerServiceWorker() {
    if (!("serviceWorker" in navigator)) return; // navigateur trop ancien : on ignore
    navigator.serviceWorker.register(CONFIG_PWA.serviceWorkerPath).catch(function (erreur) {
        console.error("Service worker non enregistré :", erreur);
    });
}


/* ---------- 9. FAVICON ----------
   Ajoute l'icône de l'onglet à TOUTES les pages sans toucher à leur HTML.
   Si une page déclare déjà son icône dans <head>, on ne fait rien. */
function ajouterFavicon() {
    if (document.querySelector('link[rel~="icon"]')) return;

    const lien = document.createElement("link");
    lien.rel = "icon";
    lien.type = "image/svg+xml";
    lien.href = CONFIG.faviconPath;
    document.head.appendChild(lien);
}


/* ---------- 9bis. BOUTON WHATSAPP FLOTTANT ----------
   Ajouté en bas à droite de CHAQUE page (sauf si la page a déjà un bouton
   WhatsApp dans sa zone visible immédiate, ce n'est pas vérifié ici : on
   l'affiche partout, c'est l'usage standard). Sur mobile, il remonte
   au-dessus de la barre de navigation du bas (voir style.css). */
function ajouterBoutonWhatsappFlottant() {
    const lien = document.createElement("a");
    lien.href = "https://wa.me/" + CONFIG.whatsappNumber +
        "?text=" + encodeURIComponent("Bonjour Francis, je viens de visiter votre site EDC.");
    lien.className = "whatsapp-flottant";
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";
    lien.setAttribute("aria-label", "Contacter sur WhatsApp");
    lien.innerHTML =
        '<svg viewBox="0 0 32 32" aria-hidden="true">' +
        '<path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.42.7 4.68 1.9 6.58L4 29l7.6-1.85a12 12 0 0 0 4.42.85h.01c6.62 0 12.02-5.4 12.02-12.02C28.04 8.4 22.65 3 16.02 3Zm0 21.9c-1.47 0-2.9-.38-4.15-1.1l-.3-.17-3.12.76.78-3.14-.2-.32a9.86 9.86 0 0 1-1.5-5.21c0-5.46 4.44-9.9 9.9-9.9 5.45 0 9.9 4.44 9.9 9.9s-4.45 9.9-9.9 9.9Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/>' +
        "</svg>";
    document.body.appendChild(lien);
}


/* ---------- 9. DÉMARRAGE ----------
   Ordre important : on charge d'abord header et footer, PUIS on active
   ce qui dépend d'eux (lien actif, menu mobile, année). */
async function demarrer() {
    ajouterFavicon();   // immédiat : ne dépend pas du chargement des composants
    ajouterBalisesPwa(); // idem
    ajouterBoutonWhatsappFlottant(); // idem

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
        ),
        chargerBarreDuBas()
    ]);

    marquerLienActif();
    initialiserMenuMobile();
    initialiserEnteteFixe();
    mettreAJourAnnee();
    initialiserFormulaireService();
    initialiserFormulaireFormations();
    enregistrerServiceWorker();
}

demarrer();
