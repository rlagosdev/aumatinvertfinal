import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Save, AlertCircle, Eye, EyeOff, Store, Heart, Users, Award, Info } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import ImageUploadField from './ImageUploadField';

interface AboutSection {
  id: string;
  section_key: string;
  image_url: string;
  titre: string;
  description: string;
  icon: string;
  position: number;
  actif: boolean;
}

const ICON_MAP: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Store': Store,
  'Heart': Heart,
  'Users': Users,
  'Award': Award,
  'Info': Info
};

const AboutConfigManager: React.FC = () => {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('a_propos_config')
        .select('*')
        .order('position');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching about sections:', error);
      toast.error('Erreur lors du chargement des sections');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (sectionId: string, updates: Partial<AboutSection>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('a_propos_config')
        .update(updates)
        .eq('id', sectionId);

      if (error) throw error;

      // Update local state
      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      ));

      toast.success('Section mise à jour avec succès');
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionVisibility = async (sectionId: string, currentState: boolean) => {
    await handleUpdateSection(sectionId, { actif: !currentState });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-site-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Info className="h-6 w-6 mr-2 text-site-primary" />
              Configuration de la Page À Propos
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez les images et textes de votre page À Propos
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Comment utiliser ?</h3>
              <p className="text-sm text-blue-800">
                Modifiez les URLs des images, les titres et descriptions de chaque section.
                Vous pouvez uploader vos propres images sur des services comme{' '}
                <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  ImgBB
                </a>{' '}
                ou utiliser les images des dossiers locaux après les avoir uploadées.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const IconComponent = ICON_MAP[section.icon] || Info;

            return (
              <div
                key={section.id}
                className={`border rounded-lg p-6 transition-all ${
                  section.actif
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-300 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-site-primary text-white rounded-full text-sm font-bold">
                      {section.position}
                    </span>
                    <IconComponent className="h-6 w-6 text-site-primary" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.titre}
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleSectionVisibility(section.id, section.actif)}
                    className={`p-2 rounded-lg transition-colors ${
                      section.actif
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={section.actif ? 'Masquer' : 'Afficher'}
                  >
                    {section.actif ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image Preview & URL */}
                  <div>
                    <ImageUploadField
                      label="Image"
                      value={section.image_url}
                      onChange={(url) => {
                        const newSections = [...sections];
                        const index = newSections.findIndex(s => s.id === section.id);
                        newSections[index].image_url = url;
                        setSections(newSections);
                        handleUpdateSection(section.id, { image_url: url });
                      }}
                      placeholder="https://example.com/image.jpg"
                      showPreview={true}
                      previewClassName="h-48"
                      cropAspect={16 / 9}
                    />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={section.titre}
                        onChange={(e) => {
                          const newSections = [...sections];
                          const index = newSections.findIndex(s => s.id === section.id);
                          newSections[index].titre = e.target.value;
                          setSections(newSections);
                        }}
                        onBlur={(e) => handleUpdateSection(section.id, { titre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={section.description}
                        onChange={(e) => {
                          const newSections = [...sections];
                          const index = newSections.findIndex(s => s.id === section.id);
                          newSections[index].description = e.target.value;
                          setSections(newSections);
                        }}
                        onBlur={(e) => handleUpdateSection(section.id, { description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icône
                      </label>
                      <select
                        value={section.icon}
                        onChange={(e) => {
                          const newSections = [...sections];
                          const index = newSections.findIndex(s => s.id === section.id);
                          newSections[index].icon = e.target.value;
                          setSections(newSections);
                        }}
                        onBlur={(e) => handleUpdateSection(section.id, { icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                      >
                        <option value="Store">Magasin (Store)</option>
                        <option value="Heart">Coeur (Heart)</option>
                        <option value="Users">Utilisateurs (Users)</option>
                        <option value="Award">Récompense (Award)</option>
                        <option value="Info">Info</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">💡 Astuce</h3>
          <p className="text-sm text-green-800">
            Pour uploader vos propres images depuis le dossier <code className="bg-green-100 px-1 rounded">C:\Users\rlago\Downloads\source</code> :
          </p>
          <ol className="list-decimal list-inside text-sm text-green-800 mt-2 space-y-1">
            <li>Allez sur <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">imgbb.com</a></li>
            <li>Cliquez sur "Start uploading" et sélectionnez vos images</li>
            <li>Copiez l'URL "Direct link" de chaque image</li>
            <li>Collez ces URLs dans les champs ci-dessus</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AboutConfigManager;
