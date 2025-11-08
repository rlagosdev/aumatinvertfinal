import React, { useState, useEffect } from 'react';
import { Star, Check, X, Loader2, Eye, EyeOff, ShoppingBag, RefreshCw } from 'lucide-react';
import { useFeaturedProducts } from '../../hooks/useFeaturedProducts';
import type { FeaturedProduct } from '../../hooks/useFeaturedProducts';

interface ProductSelectorProps {
  product: FeaturedProduct;
  isSelected: boolean;
  onToggle: (productId: string) => void;
  disabled: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  product,
  isSelected,
  onToggle,
  disabled
}) => {
  const [imageError, setImageError] = React.useState(false);
  const hasValidImage = product.image_url && product.image_url.trim() !== '' && !imageError;

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-site-primary bg-purple-50'
          : 'border-gray-200 hover:border-purple-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onToggle(product.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {hasValidImage ? (
            <img
              src={product.image_url}
              alt={product.nom}
              className="w-16 h-16 object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {product.nom}
          </h4>
          <p className="text-sm text-gray-500">{product.categorie}</p>
          <p className="text-sm font-semibold text-purple-600">
            {product.prix.toFixed(2)} €
          </p>
          {!hasValidImage && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
              Sans image
            </span>
          )}
          {product.retrait_planifie && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1 ml-1">
              Retrait planifié
            </span>
          )}
        </div>
        <div className="flex-shrink-0">
          {isSelected ? (
            <Check className="h-5 w-5 text-site-primary" />
          ) : (
            <div className="h-5 w-5 border-2 border-gray-300 rounded" />
          )}
        </div>
      </div>
    </div>
  );
};

const FeaturedProductsManager: React.FC = () => {
  const {
    settings,
    availableProducts,
    loading,
    error,
    updateSelectedProducts,
    toggleEnabled,
    getFeaturedProducts,
    loadSettings
  } = useFeaturedProducts();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSelectedIds(settings.selectedProductIds);
  }, [settings.selectedProductIds]);

  const handleProductToggle = (productId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < 4) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const success = await updateSelectedProducts(selectedIds);
      if (success) {
        setMessage({
          type: 'success',
          text: 'Produits phares mis à jour avec succès!'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Erreur lors de la mise à jour des produits phares'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde'
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleEnabled = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const success = await toggleEnabled();
      if (success) {
        setMessage({
          type: 'success',
          text: `Produits phares ${!settings.isEnabled ? 'activés' : 'désactivés'} avec succès!`
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Erreur lors de la modification du statut'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde'
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage(null);

    try {
      await loadSettings();
      setMessage({
        type: 'success',
        text: 'Liste des produits actualisée!'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'actualisation'
      });
    } finally {
      setRefreshing(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const featuredProducts = getFeaturedProducts();
  const hasChanges = JSON.stringify(selectedIds.sort()) !== JSON.stringify(settings.selectedProductIds.sort());

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-site-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Star className="h-6 w-6 text-site-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            Produits Phares
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            title="Actualiser la liste des produits"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          <button
            onClick={handleToggleEnabled}
            disabled={saving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              settings.isEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {settings.isEnabled ? (
              <>
                <Eye className="h-4 w-4" />
                <span>Affiché</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Masqué</span>
              </>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Sélectionnez jusqu'à 4 produits phares ({selectedIds.length}/4)
            </h4>
            <span className="text-sm text-gray-500">
              {availableProducts.length} produit{availableProducts.length > 1 ? 's' : ''} disponible{availableProducts.length > 1 ? 's' : ''}
            </span>
          </div>
          {availableProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">Aucun produit disponible</p>
              <p className="text-sm">Ajoutez d'abord des produits actifs depuis la section "Produits"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableProducts.map((product) => (
                <ProductSelector
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.includes(product.id)}
                  onToggle={handleProductToggle}
                  disabled={!selectedIds.includes(product.id) && selectedIds.length >= 4}
                />
              ))}
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Aperçu des produits sélectionnés
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {selectedIds.map((id, index) => {
                const product = availableProducts.find(p => p.id === id);
                if (!product) return null;

                const hasValidImage = product.image_url && product.image_url.trim() !== '';

                return (
                  <div key={id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Position {index + 1}</div>
                    {hasValidImage ? (
                      <img
                        src={product.image_url}
                        alt={product.nom}
                        className="w-full h-24 object-cover rounded mb-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center';
                            placeholder.innerHTML = '<svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>';
                            parent.insertBefore(placeholder, target);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <h5 className="text-sm font-medium text-gray-900 truncate">
                      {product.nom}
                    </h5>
                    <p className="text-xs text-gray-500">{product.categorie}</p>
                    <p className="text-sm font-semibold text-site-primary">
                      {product.prix.toFixed(2)} €
                    </p>
                    {!hasValidImage && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                        ⚠️ Sans image
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Afficher les emplacements vides */}
              {Array.from({ length: 4 - selectedIds.length }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-gray-100 rounded-lg p-3 border-2 border-dashed border-gray-300">
                  <div className="text-xs text-gray-500 mb-1">Position {selectedIds.length + index + 1}</div>
                  <div className="flex items-center justify-center h-24 bg-gray-200 rounded mb-2">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 text-center">Emplacement libre</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasChanges && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Vous avez des modifications non sauvegardées
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedIds(settings.selectedProductIds)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-site-primary rounded-lg hover:bg-site-primary disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Sauvegarder</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Aperçu actuel sur la page d'accueil
          </h4>
          {settings.isEnabled && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredProducts.map((product) => {
                const hasValidImage = product.image_url && product.image_url.trim() !== '';

                return (
                  <div key={product.id} className="bg-gray-50 rounded p-2 text-sm">
                    {hasValidImage ? (
                      <img
                        src={product.image_url}
                        alt={product.nom}
                        className="w-full h-16 object-cover rounded mb-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-16 bg-gray-300 rounded mb-1 flex items-center justify-center';
                            placeholder.innerHTML = '<svg class="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>';
                            parent.insertBefore(placeholder, target);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-16 bg-gray-300 rounded mb-1 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    <p className="font-medium truncate">{product.nom}</p>
                    <p className="text-gray-600">{product.prix.toFixed(2)} €</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {settings.isEnabled
                ? 'Aucun produit sélectionné'
                : 'Section des produits phares masquée'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductsManager;