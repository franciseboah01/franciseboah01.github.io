/* ==========================================================================
   sw.js — Service worker du portfolio de Francis Eboah

   RÔLE
   1. Rend le site installable comme application (condition technique
      exigée par Android/Chrome : un service worker + manifest.json).
   2. Permet au site de s'ouvrir même sans connexion (version déjà visitée).

   FONCTIONNEMENT
   - Page HTML (navigation) -> on essaie le réseau d'abord (contenu à jour),
     et si ça échoue (hors-ligne) -> on sert la version en cache.
   - Fichiers statiques (CSS, JS, images, composants) -> on sert le cache en
     priorité (rapide), et on met à jour le cache en arrière-plan.

   METTRE À JOUR LE SITE APRÈS UN CHANGEMENT
   Changer CACHE_VERSION ci-dessous (ex. "v1" -> "v2") : l'ancien cache est
   supprimé automatiquement et les fichiers sont re-téléchargés. Sans ça,
   les visiteurs ayant déjà installé l'app peuvent voir une version ancienne
   pendant un moment. */

const CACHE_VERSION = "v3";
const CACHE_NAME = "edc-" + CACHE_VERSION;

// Fichiers mis en cache dès l'installation (l'essentiel pour afficher le site)
const FICHIERS_ESSENTIELS = [
    "./",
    "index.html",
    "about.html",
    "skills.html",
    "services.html",
    "formations.html",
    "contact.html",
    "404.html",
    "css/style.css",
    "js/main.js",
    "components/header.html",
    "components/footer.html",
    "manifest.json",
    "assets/francis-eboah.png",
    "assets/favicon.svg",
    "assets/icon-192.png",
    "assets/icon-512.png"
];

self.addEventListener("install", function (evenement) {
    evenement.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            // { cache: "reload" } évite de piocher dans un cache HTTP périmé
            return Promise.all(
                FICHIERS_ESSENTIELS.map(function (fichier) {
                    return cache.add(new Request(fichier, { cache: "reload" })).catch(function () {
                        // Un fichier manquant ne doit pas bloquer l'installation entière
                    });
                })
            );
        })
    );
    self.skipWaiting(); // active la nouvelle version sans attendre la fermeture des onglets
});

self.addEventListener("activate", function (evenement) {
    evenement.waitUntil(
        caches.keys().then(function (noms) {
            return Promise.all(
                noms
                    .filter(function (nom) { return nom !== CACHE_NAME; })
                    .map(function (nom) { return caches.delete(nom); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function (evenement) {
    const requete = evenement.request;

    // On ignore tout ce qui n'est pas une requête GET (ex. envoi de formulaire)
    if (requete.method !== "GET") return;

    const estNavigation = requete.mode === "navigate";

    if (estNavigation) {
        // Page HTML : réseau d'abord, cache si hors-ligne
        evenement.respondWith(
            fetch(requete)
                .then(function (reponse) {
                    const copie = reponse.clone();
                    caches.open(CACHE_NAME).then(function (cache) { cache.put(requete, copie); });
                    return reponse;
                })
                .catch(function () {
                    return caches.match(requete).then(function (reponse) {
                        return reponse || caches.match("index.html");
                    });
                })
        );
        return;
    }

    // Fichier statique : cache d'abord (rapide), mise à jour en arrière-plan
    evenement.respondWith(
        caches.match(requete).then(function (reponseCache) {
            const miseAJour = fetch(requete)
                .then(function (reponse) {
                    const copie = reponse.clone();
                    caches.open(CACHE_NAME).then(function (cache) { cache.put(requete, copie); });
                    return reponse;
                })
                .catch(function () { return reponseCache; });

            return reponseCache || miseAJour;
        })
    );
});
