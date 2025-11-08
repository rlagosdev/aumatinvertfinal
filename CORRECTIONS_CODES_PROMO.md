# Corrections du système de codes promo

## Problèmes corrigés

### 1. Affichage du nombre de personnes dans le panier ✅
**Problème**: Lorsqu'un produit avec un palier de prix (ex: plateau 6 personnes) était ajouté au panier, le nombre de personnes n'apparaissait pas.

**Solution**:
- Modifié `ProductCard.tsx` pour ajouter le nombre de personnes (`selectedTier.quantity`) dans les métadonnées lors de l'ajout au panier
- Le nombre de personnes est maintenant affiché correctement dans le panier via le composant `CartItemPersonInfo`

### 2. Validation des codes promo pour tous les types de pricing ✅
**Problème**: Les codes promo créés dans les paliers de prix, dans la section produit ou dans la section dédiée aux promos ne fonctionnaient pas tous correctement.

**Solution**:
- Créé une nouvelle fonction SQL `validate_promo_code` améliorée (`fix-promo-validation.sql`)
- La fonction utilise maintenant un système de priorités pour valider les codes :
  1. Code spécifique au produit + type de pricing exact
  2. Code spécifique au produit + item de pricing (tier/range/section ID)
  3. Code "ALL_PRODUCTS" avec le même type de pricing
  4. Code pour ce produit avec pricing_type 'normal' (fallback)

- Mis à jour `usePromoCodes.ts` pour gérer le nouveau format JSON de retour

## Instructions pour appliquer les corrections

### Étape 1: Mettre à jour la base de données
Exécutez le script SQL dans votre base de données Supabase :

```bash
# Via l'interface Supabase SQL Editor
# Copiez et exécutez le contenu du fichier: fix-promo-validation.sql
```

Ou via la ligne de commande si vous avez configuré Supabase CLI :
```bash
supabase db execute -f fix-promo-validation.sql
```

### Étape 2: Les modifications TypeScript sont déjà appliquées
Les fichiers suivants ont été modifiés et sont prêts :
- ✅ `src/hooks/usePromoCodes.ts` - Gestion améliorée de la validation
- ✅ `src/components/ProductCard.tsx` - Ajout du nombre de personnes dans les métadonnées
- ✅ `src/pages/Cart.tsx` - Affichage amélioré des informations produit

## Comment utiliser les codes promo maintenant

### 1. Créer un code promo pour un palier de prix spécifique
Dans l'interface admin, lors de l'édition d'un produit avec paliers de prix :
1. Allez dans l'onglet "Paliers de prix"
2. Sélectionnez le palier souhaité
3. Activez la promotion
4. Le code promo sera automatiquement validé pour ce palier

### 2. Créer un code promo pour tous les produits
Dans la section dédiée aux codes promo :
1. Sélectionnez "ALL_PRODUCTS" comme produit
2. Choisissez le type de pricing (normal, tier, range, etc.)
3. Le code fonctionnera pour tous les produits du type sélectionné

### 3. Créer un code promo pour un produit spécifique
Dans l'interface admin :
1. Sélectionnez le produit
2. Créez le code promo avec le type de pricing souhaité
3. Le code fonctionnera uniquement pour ce produit

## Système de priorités des codes promo

Lorsqu'un client applique un code promo, le système cherche dans cet ordre :

1. **Code spécifique au produit avec type de pricing exact**
   - Exemple: Code "PLATEAU10" pour le produit "Plateau apéritif" avec pricing_type "tier"

2. **Code spécifique au produit avec item ID**
   - Exemple: Code pour le palier "6 personnes" spécifiquement

3. **Code ALL_PRODUCTS avec le même type de pricing**
   - Exemple: Code "PROMO20" pour tous les produits vendus par paliers

4. **Code pour le produit avec pricing_type 'normal'** (fallback)
   - S'applique si aucun autre code n'est trouvé

## Tests recommandés

Testez les scénarios suivants pour valider le bon fonctionnement :

### Test 1: Code promo sur palier de prix
1. Créez un code promo pour un produit avec paliers
2. Ajoutez le produit au panier en sélectionnant un palier (ex: 6 personnes)
3. Vérifiez que "👥 6 pers." s'affiche dans le panier
4. Appliquez le code promo
5. Vérifiez que la réduction est appliquée

### Test 2: Code ALL_PRODUCTS
1. Créez un code avec product_id = 'ALL_PRODUCTS'
2. Ajoutez plusieurs produits au panier
3. Appliquez le code
4. Vérifiez qu'il s'applique à tous les produits compatibles

### Test 3: Code pour gamme de produits
1. Créez un code pour une gamme spécifique (range)
2. Ajoutez un produit de cette gamme au panier
3. Appliquez le code
4. Vérifiez la réduction

## Notes importantes

- ⚠️ Après avoir exécuté le script SQL, les codes promo existants continueront de fonctionner
- ⚠️ Le système est maintenant plus permissif et cherche plusieurs correspondances possibles
- ⚠️ Les dates de validité, limites d'utilisation et statut actif sont toujours vérifiés
- ✅ Les logs dans la console du navigateur (F12) affichent le détail de la validation pour le débogage

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez que le script SQL a bien été exécuté dans Supabase
3. Vérifiez que les codes promo sont marqués comme "actif" dans la base de données
