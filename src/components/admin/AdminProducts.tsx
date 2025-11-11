import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../supabase/client';
import { Plus, Edit, Trash2, Upload, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductForm from './ProductForm';
import ImageUploader from './ImageUploader';
import ExportButton from './ExportButton';
import ImportButton from './ImportButton';
import { formatDataForExport } from '../../utils/exportUtils';

interface Product {
  id: string;
  nom: string;
  prix: number;
  categorie: string;
  retrait_planifie: boolean | null;
  image_url: string | null;
  actif: boolean | null;
  delai_retrait_valeur?: number | null;
  delai_retrait_unite?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  first_media_url?: string | null; // Première image depuis product_media
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [sortBy, setSortBy] = useState<'nom' | 'categorie' | 'prix'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('nom');

      if (error) throw error;

      // Récupérer la première image depuis product_media pour chaque produit
      const productsWithMedia = await Promise.all(
        (data || []).map(async (product) => {
          const { data: mediaData } = await supabase
            .from('product_media')
            .select('media_url')
            .eq('product_id', product.id)
            .eq('media_type', 'image')
            .order('media_order')
            .limit(1)
            .single();

          return {
            ...product,
            first_media_url: mediaData?.media_url || null
          };
        })
      );

      setProducts(productsWithMedia);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Générer dynamiquement la liste des catégories à partir des produits et de la table categories
  const categories = useMemo(() => {
    // Extraire toutes les catégories uniques des produits
    const productCategories = [...new Set(products.map(p => p.categorie).filter(Boolean))];

    // Trier alphabétiquement et ajouter "Toutes" en premier
    return ['Toutes', ...productCategories.sort()];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Toutes' || product.categorie === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'nom':
          aValue = a.nom.toLowerCase();
          bValue = b.nom.toLowerCase();
          break;
        case 'categorie':
          aValue = a.categorie.toLowerCase();
          bValue = b.categorie.toLowerCase();
          break;
        case 'prix':
          aValue = a.prix;
          bValue = b.prix;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleEdit = (product: Product) => {
    // Scroll vers le haut AVANT d'ouvrir le modal
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setEditingProduct(product);
    setShowForm(true);

    // Scroll le modal aussi après son ouverture
    setTimeout(() => {
      const modalContainer = document.querySelector('.fixed.inset-0.overflow-y-auto');
      if (modalContainer) {
        modalContainer.scrollTop = 0;
      }
    }, 100);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  const handleToggleActive = async (productId: string, actif: boolean | null) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ actif: !actif })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p =>
        p.id === productId ? { ...p, actif: !actif } : p
      ));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleImport = async (data: any[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .insert(data);

      if (error) {
        console.error('Error importing products:', error);
        toast.error('Erreur lors de l\'import des produits');
        return false;
      }

      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error('Erreur lors de l\'import des produits');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-site-primary mx-auto"></div>
        <p className="mt-4 text-zinc-600">Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Gestion des Produits</h2>
        <div className="flex space-x-3">
          <ExportButton 
            data={formatDataForExport.products(filteredAndSortedProducts)}
            filename="produits"
            disabled={loading || products.length === 0}
          />
          <ImportButton 
            type="products"
            onImport={handleImport}
            disabled={loading}
          />
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Aide Images</span>
          </button>
          <button
            onClick={() => {
              // Scroll vers le haut AVANT d'ouvrir le modal
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setShowForm(true);
              // Scroll le modal aussi après son ouverture
              setTimeout(() => {
                const modalContainer = document.querySelector('.fixed.inset-0.overflow-y-auto');
                if (modalContainer) {
                  modalContainer.scrollTop = 0;
                }
              }, 100);
            }}
            className="flex items-center space-x-2 bg-site-primary text-white px-4 py-2 rounded-lg hover:bg-site-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter Produit</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'nom' | 'categorie' | 'prix')}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent bg-white"
          >
            <option value="nom">Trier par nom</option>
            <option value="categorie">Trier par catégorie</option>
            <option value="prix">Trier par prix</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent bg-white"
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Retrait Planifié
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Délai de Retrait
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Actif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {filteredAndSortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.first_media_url || product.image_url || 'https://via.placeholder.com/40'}
                        alt={product.nom}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/40';
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{product.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-site-primary rounded-full">
                      {product.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                    {product.prix.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.retrait_planifie ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-pink-100 text-site-buttons rounded-full">
                        Oui
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        Non
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                    {product.retrait_planifie ? (
                      <span className="text-orange-600 font-medium">
                        {product.delai_retrait_valeur || 4} {product.delai_retrait_unite || 'jours'}
                      </span>
                    ) : (
                      <span className="text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(product.id, product.actif)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        product.actif ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          product.actif ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-site-primary hover:text-site-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">
            {products.length === 0 ? 'Aucun produit trouvé.' : 'Aucun produit ne correspond aux critères de recherche.'}
          </p>
        </div>
      )}

      {/* Products count */}
      {!loading && (
        <div className="mt-4 text-sm text-zinc-600">
          Affichage de {filteredAndSortedProducts.length} sur {products.length} produits
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
        />
      )}

      {/* Image Uploader Modal */}
      {showUploader && (
        <ImageUploader
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};

export default AdminProducts;