# Portfolio — Francis Eboah

Site statique publié avec GitHub Pages : https://franciseboah01.github.io

## Structure

```
franciseboah01.github.io/
├── index.html · about.html · skills.html · services.html · contact.html
├── formations.html        → inscription (Digital & Design + particuliers) avec paiement Wave
├── 404.html               → page affichée par GitHub Pages pour une adresse inconnue
├── manifest.json          → identité de l'app installable (nom, icônes, couleurs)
├── sw.js                  → service worker (installation + hors-ligne)
├── css/style.css          → tout le design (variables de couleur en haut)
├── js/main.js             → header/footer, menu mobile, formulaire WhatsApp, PWA
├── components/
│   ├── header.html        → menu du haut (modifié ici = modifié partout)
│   ├── footer.html        → pied de page (idem)
│   └── bottom-nav.html    → barre du bas, visible sur téléphone uniquement
└── assets/
    ├── francis-eboah.png      → photo de profil
    ├── favicon.svg            → icône de l'onglet (ajoutée par main.js)
    ├── icon-192.png           → icône app (192×192)
    ├── icon-512.png           → icône app (512×512)
    ├── icon-maskable-512.png  → icône app, fond plein pour découpe Android
    ├── apple-touch-icon.png   → icône app pour iPhone (180×180)
    └── og-image.png           → aperçu affiché quand le lien est partagé
                                  (WhatsApp, Facebook...), 1200×630
```

## Application installable (PWA)

Le site peut être installé comme une application (icône sur l'écran d'accueil,
plein écran, sans barre d'adresse) :

- **Android (Chrome)** : bandeau d'installation automatique après quelques visites.
- **iPhone (Safari)** : installation manuelle via « Partager → Sur l'écran d'accueil »
  (Apple ne propose pas de bandeau automatique).

Tout est injecté en JavaScript par `js/main.js` (fonctions `ajouterBalisesPwa` et
`enregistrerServiceWorker`) : aucune balise à ajouter dans les pages HTML.

- **Changer le nom / les couleurs de l'app** : `manifest.json`.
- **Changer l'icône** : régénérer les fichiers dans `assets/` (mêmes noms de
  fichiers, mêmes tailles : 192×192, 512×512, 512×512 maskable, 180×180 Apple).
- **Mettre à jour le site après un changement** : changer `CACHE_VERSION` en haut de
  `sw.js` (sinon les visiteurs ayant déjà installé l'app peuvent voir une ancienne
  version pendant un moment, le temps que le nouveau service worker prenne le relais).
- **Barre du bas** (Accueil / Formations / Services / EDC) : `components/bottom-nav.html`.

## Aperçu de partage (WhatsApp, Facebook...)

Chaque page a ses propres balises Open Graph (titre, description, image)
dans son `<head>`, basées sur son `<title>` et sa balise `description` —
rien à maintenir séparément, sauf si tu changes l'image : `assets/og-image.png`.

- **Changer l'image d'aperçu** : remplacer `assets/og-image.png` (1200×630 px).
- **Changer le texte d'une page** : modifier son `<title>` et son
  `<meta name="description">` — les balises `og:title` / `og:description`
  à côté doivent être mises à jour manuellement pour rester identiques.

## Tester en local

Le header et le footer sont chargés par JavaScript (`fetch`) : ouvrir un fichier
par double-clic ne fonctionne pas. Lancer un serveur depuis le dossier du site :

```
python -m http.server 8000
```

puis ouvrir http://localhost:8000 (ou utiliser l'extension « Live Server » de VS Code).

## Tâches courantes

- **Ajouter une page au menu** : créer la page, puis ajouter le lien dans
  `components/header.html` ET `components/footer.html`.
- **Changer une couleur** : modifier la variable dans `:root` en haut de `css/style.css`.
- **Changer le numéro WhatsApp** : `js/main.js` (`CONFIG.whatsappNumber`) et les liens
  `https://wa.me/...` dans `index.html` et `contact.html`.
- **Changer un tarif de formation** : nouveau tarif × 1,01 (frais de transaction),
  puis mettre à jour ce montant à 2 endroits dans `formations.html` (texte affiché
  et attribut `data-montant...` du formulaire) ; le lien Wave est reconstruit
  automatiquement par `js/main.js` à partir de ce montant.
- **Changer le compte Wave** : une seule ligne à modifier, `js/main.js`
  (`CONFIG.waveMarchand`).
- **Pas de bouton de paiement direct sur formations.html** : volontaire, le
  visiteur doit passer par le formulaire WhatsApp pour que Francis sache qui
  s'inscrit avant tout paiement. Le lien Wave n'apparaît que dans le message
  WhatsApp envoyé (construit par `js/main.js`).
- **Champs du formulaire protégés** : le numéro WhatsApp n'accepte que des
  chiffres et espaces (8 à 15 caractères), le nom demande au moins 2
  caractères — évite les saisies accidentelles du type « 0743contact.html ».
