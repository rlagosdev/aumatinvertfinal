# 🎨 Guide : Générer les icônes pour la PWA

## Option 1 : Utiliser le script automatique (Recommandé)

### Étape 1 : Préparer ton logo
1. Crée ou obtiens un logo Au Matin Vert au format PNG
2. Taille minimum : **512x512 pixels**
3. Fond transparent recommandé
4. Sauvegarde-le sous le nom : `public/logo-source.png`

### Étape 2 : Installer Sharp
```bash
npm install --save-dev sharp
```

### Étape 3 : Générer les icônes
```bash
node scripts/generate-icons.js
```

✅ Toutes les icônes seront générées automatiquement !

---

## Option 2 : Utiliser un outil en ligne (Facile)

### 🌐 PWA Asset Generator
1. Va sur : https://www.pwabuilder.com/imageGenerator
2. Upload ton logo (512x512px minimum)
3. Clique sur "Download"
4. Décompresse le fichier ZIP
5. Copie tous les fichiers `icon-*.png` dans le dossier `public/`

### 🌐 RealFaviconGenerator
1. Va sur : https://realfavicongenerator.net/
2. Upload ton logo
3. Dans "iOS Web App", choisis "Dedicated picture"
4. Dans "Android Chrome", choisis "Use a dedicated picture"
5. Génère et télécharge
6. Copie les fichiers dans `public/`

---

## Option 3 : Manuellement avec Photoshop/GIMP/Figma

Crée les fichiers suivants dans `public/` :

| Fichier | Taille | Usage |
|---------|--------|-------|
| `icon-72x72.png` | 72x72px | Android petit écran |
| `icon-96x96.png` | 96x96px | Android normal |
| `icon-128x128.png` | 128x128px | Android HD |
| `icon-144x144.png` | 144x144px | Windows/Android |
| `icon-152x152.png` | 152x152px | iOS iPad |
| `icon-192x192.png` | 192x192px | Android Full HD |
| `icon-384x384.png` | 384x384px | Splash screen |
| `icon-512x512.png` | 512x512px | Haute résolution |

### Conseils pour créer les icônes :
- ✅ Utilise un fond de couleur (pas transparent pour certains appareils)
- ✅ Ajoute un padding de 10% autour du logo
- ✅ Garde le design simple et reconnaissable
- ✅ Teste sur fond clair et foncé
- ✅ Format PNG avec compression optimale

---

## Option 4 : Utiliser l'icône SVG temporaire (Déjà fait)

Pour l'instant, j'ai créé une icône SVG temporaire dans `public/icon.svg`.

Tu peux :
1. La convertir en PNG avec un outil comme https://convertio.co/svg-png/
2. Ou utiliser Inkscape (gratuit) :
   ```bash
   # Exporter en PNG de différentes tailles
   inkscape public/icon.svg --export-filename=public/icon-512x512.png --export-width=512
   inkscape public/icon.svg --export-filename=public/icon-192x192.png --export-width=192
   # etc...
   ```

---

## ✅ Vérification

Une fois les icônes générées, vérifie qu'elles sont bien présentes :

```bash
ls public/icon-*.png
```

Tu devrais voir :
```
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
```

---

## 🚀 Prochaine étape

Une fois les icônes prêtes, la PWA sera complète et prête à être installée ! 🎉
