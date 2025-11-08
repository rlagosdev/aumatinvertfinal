import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Star, Eye, EyeOff, Save, X, ArrowUp, ArrowDown } from 'lucide-react';

interface GoogleReview {
  id: string;
  author_name: string;
  author_photo_url?: string;
  rating: number;
  review_text: string;
  review_date: string;
  is_active: boolean;
  display_order: number;
}

const GoogleReviewsList: React.FC = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    author_name: '',
    author_photo_url: '',
    rating: 5,
    review_text: '',
    review_date: new Date().toISOString().split('T')[0],
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('google_reviews')
        .select('*')
        .order('display_order', { ascending: false })
        .order('review_date', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      author_name: '',
      author_photo_url: '',
      rating: 5,
      review_text: '',
      review_date: new Date().toISOString().split('T')[0],
      is_active: true,
      display_order: 0,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAdd = async () => {
    if (!formData.author_name || !formData.review_text) {
      toast.error('Le nom et le texte de l\'avis sont obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('google_reviews')
        .insert([formData]);

      if (error) throw error;

      toast.success('Avis ajouté avec succès !');
      resetForm();
      fetchReviews();
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Erreur lors de l\'ajout de l\'avis');
    }
  };

  const handleEdit = (review: GoogleReview) => {
    setFormData({
      author_name: review.author_name,
      author_photo_url: review.author_photo_url || '',
      rating: review.rating,
      review_text: review.review_text,
      review_date: review.review_date,
      is_active: review.is_active,
      display_order: review.display_order,
    });
    setEditingId(review.id);
    setShowAddForm(false);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    if (!formData.author_name || !formData.review_text) {
      toast.error('Le nom et le texte de l\'avis sont obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('google_reviews')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Avis modifié avec succès !');
      resetForm();
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Erreur lors de la modification de l\'avis');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      const { error } = await supabase
        .from('google_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Avis supprimé avec succès !');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erreur lors de la suppression de l\'avis');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('google_reviews')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(!currentStatus ? 'Avis activé' : 'Avis désactivé');
      fetchReviews();
    } catch (error) {
      console.error('Error toggling review:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const review = reviews.find(r => r.id === id);
    if (!review) return;

    const newOrder = direction === 'up' ? review.display_order + 1 : review.display_order - 1;

    try {
      const { error } = await supabase
        .from('google_reviews')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;

      fetchReviews();
    } catch (error) {
      console.error('Error reordering review:', error);
      toast.error('Erreur lors du réordonnancement');
    }
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-zinc-300'
            } ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-zinc-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-zinc-800">Gestion des Avis Google</h3>
          <p className="text-sm text-zinc-600 mt-1">
            {reviews.length} avis au total ({reviews.filter(r => r.is_active).length} actifs)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un avis</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-zinc-800">
              {editingId ? 'Modifier l\'avis' : 'Ajouter un nouvel avis'}
            </h4>
            <button
              onClick={resetForm}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Author Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Nom de l'auteur *
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => handleInputChange('author_name', e.target.value)}
                placeholder="Ex: Marie Dupont"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Author Photo URL */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                URL de la photo (optionnel)
              </label>
              <input
                type="url"
                value={formData.author_photo_url}
                onChange={(e) => handleInputChange('author_photo_url', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Si vide, une initiale sera affichée
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Note *
              </label>
              {renderStars(formData.rating, (rating) => handleInputChange('rating', rating))}
            </div>

            {/* Review Date */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Date de l'avis *
              </label>
              <input
                type="date"
                value={formData.review_date}
                onChange={(e) => handleInputChange('review_date', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Texte de l'avis *
              </label>
              <textarea
                value={formData.review_text}
                onChange={(e) => handleInputChange('review_text', e.target.value)}
                placeholder="Ex: Excellents produits frais et locaux ! Le service est impeccable..."
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Ordre d'affichage
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Plus le nombre est élevé, plus l'avis apparaîtra en premier
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Avis actif
                </label>
                <p className="text-xs text-zinc-500">
                  Afficher cet avis sur le site
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingId ? 'Mettre à jour' : 'Ajouter'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
            <Star className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-600 mb-2">Aucun avis pour le moment</p>
            <p className="text-sm text-zinc-500">
              Cliquez sur "Ajouter un avis" pour commencer
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-lg border p-6 ${
                review.is_active
                  ? 'border-zinc-200'
                  : 'border-zinc-200 bg-zinc-50 opacity-60'
              }`}
            >
              <div className="flex gap-4">
                {/* Author Photo */}
                <div className="flex-shrink-0">
                  {review.author_photo_url ? (
                    <img
                      src={review.author_photo_url}
                      alt={review.author_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-site-primary to-site-buttons flex items-center justify-center text-white font-bold text-lg">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-zinc-800">{review.author_name}</h4>
                      <p className="text-sm text-zinc-500">
                        {new Date(review.review_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Reorder Buttons */}
                      <button
                        onClick={() => handleReorder(review.id, 'up')}
                        className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded"
                        title="Monter"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(review.id, 'down')}
                        className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded"
                        title="Descendre"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-zinc-500 px-2">#{review.display_order}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-3">
                    {renderStars(review.rating)}
                  </div>

                  {/* Review Text */}
                  <p className="text-zinc-700 text-sm mb-4">{review.review_text}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(review.id, review.is_active)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        review.is_active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {review.is_active ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Actif</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Inactif</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(review)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoogleReviewsList;
