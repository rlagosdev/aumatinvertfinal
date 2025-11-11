import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Tag, ChevronUp, ChevronDown, X } from 'lucide-react';
import ExportButton from './ExportButton';
import ImportButton from './ImportButton';
import ImageUploadField from './ImageUploadField';
import { formatDataForExport } from '../../utils/exportUtils';

interface Category {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  type_categorie: string | null;
  actif: boolean | null;
  position: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CarouselImage {
  id?: string;
  category_id: string;
  image_url: string;
  position: number;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    image_url: '',
    type_categorie: 'epicerie',
    actif: true,
    position: 0,
  });
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [newCarouselImage, setNewCarouselImage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Scroll automatique quand le formulaire s'ouvre (une seule fois)
  useEffect(() => {
    if (showForm) {
      // Scroll la page principale immédiatement
      window.scrollTo(0, 0);
    }
  }, [showForm]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('position', { ascending: true })
        .order('nom');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            nom: formData.nom,
            description: formData.description || null,
            image_url: formData.image_url || null,
            type_categorie: formData.type_categorie,
            actif: formData.actif,
            position: formData.position,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Catégorie mise à jour avec succès');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            nom: formData.nom,
            description: formData.description || null,
            image_url: formData.image_url || null,
            type_categorie: formData.type_categorie,
            actif: formData.actif,
            position: formData.position,
          });

        if (error) throw error;
        toast.success('Catégorie créée avec succès');
      }

      await fetchCategories();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const fetchCarouselImages = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('category_carousel_images')
        .select('*')
        .eq('category_id', categoryId)
        .order('position');

      if (error) throw error;
      setCarouselImages(data || []);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const handleEdit = async (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nom: category.nom,
      description: category.description || '',
      image_url: category.image_url || '',
      type_categorie: category.type_categorie || 'epicerie',
      actif: category.actif ?? true,
      position: category.position ?? 0,
    });
    await fetchCarouselImages(category.id);
    setShowForm(true);
    // Le scroll est géré par useEffect
  };

  const handleAddCarouselImage = async () => {
    if (!newCarouselImage || !editingCategory) return;

    try {
      const newPosition = carouselImages.length;

      console.log('Adding carousel image:', {
        category_id: editingCategory.id,
        image_url: newCarouselImage,
        position: newPosition
      });

      const { data, error } = await supabase
        .from('category_carousel_images')
        .insert({
          category_id: editingCategory.id,
          image_url: newCarouselImage,
          position: newPosition,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      setCarouselImages([...carouselImages, data]);
      setNewCarouselImage('');
      toast.success('Image ajoutée au carrousel');
    } catch (error: any) {
      console.error('Error adding carousel image:', error);
      const errorMessage = error?.message || error?.details || 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const handleRemoveCarouselImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('category_carousel_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      // Mettre à jour les positions après suppression
      const updatedImages = carouselImages.filter(img => img.id !== imageId);

      // Réindexer les positions
      for (let i = 0; i < updatedImages.length; i++) {
        if (updatedImages[i].position !== i) {
          await supabase
            .from('category_carousel_images')
            .update({ position: i })
            .eq('id', updatedImages[i].id!);
          updatedImages[i].position = i;
        }
      }

      setCarouselImages(updatedImages);
      toast.success('Image supprimée du carrousel');
    } catch (error: any) {
      console.error('Error removing carousel image:', error);
      const errorMessage = error?.message || error?.details || 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const handleMoveCarouselImage = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = carouselImages.findIndex(img => img.id === imageId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === carouselImages.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newImages = [...carouselImages];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    try {
      // Update positions in database
      await Promise.all(
        newImages.map((img, index) =>
          supabase
            .from('category_carousel_images')
            .update({ position: index })
            .eq('id', img.id!)
        )
      );

      setCarouselImages(newImages);
      toast.success('Position mise à jour');
    } catch (error) {
      console.error('Error updating carousel image position:', error);
      toast.error('Erreur lors de la mise à jour de la position');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== categoryId));
      toast.success('Catégorie supprimée avec succès');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (categoryId: string, actif: boolean | null) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ actif: !actif, updated_at: new Date().toISOString() })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, actif: !actif } : c
      ));
      toast.success('Statut mis à jour');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ nom: '', description: '', image_url: '', type_categorie: 'epicerie', actif: true, position: 0 });
    setCarouselImages([]);
    setNewCarouselImage('');
  };

  const handleImport = async (data: any[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert(data);

      if (error) {
        console.error('Error importing categories:', error);
        toast.error('Erreur lors de l\'import des catégories');
        return false;
      }

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error importing categories:', error);
      toast.error('Erreur lors de l\'import des catégories');
      return false;
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-zinc-600">Chargement des catégories...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Gestion des Catégories</h2>
        <div className="flex space-x-3">
          <ExportButton 
            data={formatDataForExport.categories(categories)}
            filename="categories"
            disabled={loading || categories.length === 0}
          />
          <ImportButton 
            type="categories"
            onImport={handleImport}
            disabled={loading}
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Catégorie</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Tag className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-sm font-medium text-zinc-900">{category.nom}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                    {category.description || 'Aucune description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(category.id, category.actif)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        category.actif ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          category.actif ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {category.created_at ? new Date(category.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-zinc-500">Aucune catégorie trouvée.</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4 pt-8">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-800">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <ImageUploadField
                  label="Image de la catégorie"
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  placeholder="https://example.com/image.jpg"
                  showPreview={true}
                  previewClassName="h-48"
                  cropAspect={16 / 9}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Type de catégorie
                </label>
                <select
                  value={formData.type_categorie}
                  onChange={(e) => setFormData({ ...formData, type_categorie: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="epicerie">Épicerie (produits prêts)</option>
                  <option value="preparation">Préparations sur commande</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Position (ordre d'affichage)
                </label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                />
              </div>

              {/* Carousel Images Section - Only show when editing */}
              {editingCategory && (
                <div className="border-t border-zinc-200 pt-4">
                  <label className="block text-sm font-medium text-zinc-700 mb-3">
                    Images du carrousel ({carouselImages.length})
                  </label>

                  {/* Add new carousel image */}
                  <div className="mb-4">
                    <ImageUploadField
                      label="Ajouter une image au carrousel"
                      value={newCarouselImage}
                      onChange={setNewCarouselImage}
                      placeholder="https://example.com/image.jpg"
                      showPreview={true}
                      previewClassName="h-32"
                      cropAspect={16 / 9}
                    />
                    <button
                      type="button"
                      onClick={handleAddCarouselImage}
                      disabled={!newCarouselImage}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter au carrousel
                    </button>
                  </div>

                  {/* List of carousel images */}
                  {carouselImages.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {carouselImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200"
                        >
                          {/* Image preview */}
                          <img
                            src={image.image_url}
                            alt={`Carrousel ${index + 1}`}
                            className="w-20 h-12 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="48"%3E%3Crect fill="%23ddd" width="80" height="48"/%3E%3C/svg%3E';
                            }}
                          />

                          {/* Image URL (truncated) */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-700 truncate">
                              {image.image_url}
                            </p>
                            <p className="text-xs text-zinc-500">
                              Position: {index + 1}
                            </p>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveCarouselImage(image.id!, 'up')}
                              disabled={index === 0}
                              className="p-1 text-zinc-600 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Monter"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveCarouselImage(image.id!, 'down')}
                              disabled={index === carouselImages.length - 1}
                              className="p-1 text-zinc-600 hover:text-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Descendre"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCarouselImage(image.id!)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Supprimer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {carouselImages.length === 0 && (
                    <p className="text-sm text-zinc-500 italic">
                      Aucune image dans le carrousel. Ajoutez-en une ci-dessus.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-zinc-100 border-zinc-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="actif" className="ml-2 text-sm text-zinc-700">
                  Catégorie active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-zinc-600 hover:text-zinc-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : (editingCategory ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;