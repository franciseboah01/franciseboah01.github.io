# Portfolio — Francis Eboah

Site statique publié avec GitHub Pages : https://franciseboah01.github.io

## Structure

```
franciseboah01.github.io/
├── index.html · about.html · skills.html · projects.html · contact.html
├── 404.html               → page affichée par GitHub Pages pour une adresse inconnue
├── css/style.css          → tout le design (variables de couleur en haut)
├── js/main.js             → header/footer, menu mobile, formulaire WhatsApp
├── components/
│   ├── header.html        → menu (modifié ici = modifié partout)
│   └── footer.html        → pied de page (idem)
└── assets/
    ├── francis-eboah.png  → photo de profil
    └── favicon.svg        → icône de l'onglet (ajoutée par main.js)
```

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
  
