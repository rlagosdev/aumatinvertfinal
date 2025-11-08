import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, AlertCircle, Save, Divide } from 'lucide-react';
import { supabase } from '../../supabase/client';

interface ProductSection {
  id: string;
  product_id: string;
  nom: string;
  description: string | null;
  fraction: number;
  prix: number;
  ordre: number;
  actif: boolean;
}

interface SectionPricingManagerProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

const COMMON_SECTIONS = [
  { nom: '1/4', fraction: 0.25, ordre: 1 },
  { nom: '1/2', fraction: 0.5, ordre: 2 },
  { nom: '3/4', fraction: 0.75, ordre: 3 },
  { nom: 'Entier', fraction: 1, ordre: 4 },
  { nom: 'Double', fraction: 2, ordre: 5 },
];

const SectionPricingManager: React.FC<SectionPricingManagerProps> = ({
  productId,
  productName,
  onClose
}) => {
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    fraction: 1,
    prix: 0,
    ordre: 0
  });

  useEffect(() => {
    loadSections();
  }, [productId]);

  const loadSections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_sections')
        .select('*')
        .eq('product_id', productId)
        .order('ordre', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (err) {
      console.error('Error loading sections:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement des sections'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    if (!formData.nom.trim()) {
      setMessage({
        type: 'error',
        text: 'Le nom de la section est requis'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (formData.fraction <= 0) {
      setMessage({
        type: 'error',
        text: 'La fraction doit être positive'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (formData.prix < 0) {
      setMessage({
        type: 'error',
        text: 'Le prix doit être positif ou nul'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('product_sections')
        .insert({
          product_id: productId,
          nom: formData.nom.trim(),
          description: formData.description.trim() || null,
          fraction: formData.fraction,
          prix: formData.prix,
          ordre: formData.ordre || sections.length + 1,
          actif: true
        })
        .select()
        .single();

      if (error) throw error;

      setSections([...sections, data]);
      setFormData({ nom: '', description: '', fraction: 1, prix: 0, ordre: 0 });

      setMessage({
        type: 'success',
        text: 'Section ajoutée avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error adding section:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'ajout de la section'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAddSection = async (sectionTemplate: typeof COMMON_SECTIONS[0]) => {
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('product_sections')
        .insert({
          product_id: productId,
          nom: sectionTemplate.nom,
          description: null,
          fraction: sectionTemplate.fraction,
          prix: 0,
          ordre: sectionTemplate.ordre,
          actif: true
        })
        .select()
        .single();

      if (error) throw error;

      setSections([...sections, data].sort((a, b) => a.ordre - b.ordre));

      setMessage({
        type: 'success',
        text: `Section "${sectionTemplate.nom}" ajoutée!`
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error adding section:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'ajout de la section'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = async (sectionId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('product_sections')
        .update({ [field]: value })
        .eq('id', sectionId);

      if (error) throw error;

      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, [field]: value } : s
      ));
    } catch (err) {
      console.error('Error updating section:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('product_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      setSections(sections.filter(s => s.id !== sectionId));

      setMessage({
        type: 'success',
        text: 'Section supprimée avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error deleting section:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tarifs par section</h3>
            <p className="text-sm text-gray-600">Produit : {productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Info :</strong> Définissez des sections/portions pour votre produit.
              Exemple : 1/4 à 5€, 1/2 à 9€, Entier à 16€
            </p>
          </div>


          {/* Formulaire d'ajout - Toujours visible */}
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une section
            </h4>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    Nom de la section *
                  </label>
                  <input
                    type="text"
                    list="section-names"
                    value={formData.nom}
                    onChange={(e) => {
                      const selectedSection = COMMON_SECTIONS.find(s => s.nom === e.target.value);
                      if (selectedSection) {
                        setFormData({ ...formData, nom: e.target.value, fraction: selectedSection.fraction, ordre: selectedSection.ordre });
                      } else {
                        setFormData({ ...formData, nom: e.target.value });
                      }
                    }}
                    placeholder="Choisissez ou tapez"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <datalist id="section-names">
                    {COMMON_SECTIONS.map((section) => (
                      <option key={section.nom} value={section.nom} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    Fraction *
                  </label>
                  <input
                    type="number"
                    list="fraction-values"
                    value={formData.fraction}
                    onChange={(e) => setFormData({ ...formData, fraction: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    placeholder="0.25, 0.5, 1, 2..."
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <datalist id="fraction-values">
                    <option value="0.25" label="1/4" />
                    <option value="0.5" label="1/2" />
                    <option value="0.75" label="3/4" />
                    <option value="1" label="Entier" />
                    <option value="2" label="Double" />
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    placeholder="Ex: 5.00"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={formData.ordre}
                    onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
                    min="0"
                    step="1"
                    placeholder="0 = auto"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-800 mb-1">
                  Description (optionnelle)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Parfait pour 6-8 personnes"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddSection}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Ajout...' : 'Ajouter la section'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Liste des sections existantes */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Sections configurées ({sections.length})
            </h4>

            {loading ? (
              <div className="text-center py-4 text-gray-600">Chargement...</div>
            ) : sections.length === 0 ? (
              <div className="text-center py-4 text-gray-600 text-sm">
                Aucune section configurée. Utilisez le formulaire ci-dessus pour ajouter des sections.
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-purple-800 mb-1">
                            Nom de la section
                          </label>
                          <input
                            type="text"
                            value={section.nom}
                            onChange={(e) => handleUpdateSection(section.id, 'nom', e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-purple-800 mb-1">
                            Fraction
                          </label>
                          <input
                            type="number"
                            value={section.fraction}
                            onChange={(e) => handleUpdateSection(section.id, 'fraction', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.25"
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-purple-800 mb-1">
                            Prix (€)
                          </label>
                          <input
                            type="number"
                            value={section.prix}
                            onChange={(e) => handleUpdateSection(section.id, 'prix', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id)}
                        className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {section.description && (
                      <div className="mt-2">
                        <p className="text-xs text-purple-700">{section.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SectionPricingManager;
