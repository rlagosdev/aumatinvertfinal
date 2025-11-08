import React, { useState } from 'react';
import { Upload, Download, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { parseCSV, validateImportData, generateCSVTemplate } from '../../utils/importUtils';

interface ImportButtonProps {
  type: 'products' | 'categories' | 'users';
  onImport: (data: any[]) => Promise<boolean>;
  disabled?: boolean;
}

const ImportButton: React.FC<ImportButtonProps> = ({ type, onImport, disabled = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'validate' | 'import'>('upload');

  const typeLabels = {
    products: 'Produits',
    categories: 'Catégories', 
    users: 'Utilisateurs'
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedData = parseCSV(csvText);
      
      if (parsedData.length === 0) {
        toast.error('Le fichier CSV est vide ou mal formaté');
        return;
      }

      const validation = validateImportData[type](parsedData);
      setCsvData(validation.validData);
      setErrors(validation.errors);
      setStep('validate');
    };
    
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      const success = await onImport(csvData);
      if (success) {
        toast.success(`${csvData.length} ${typeLabels[type].toLowerCase()} importé(s) avec succès`);
        setShowModal(false);
        resetModal();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'import');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = generateCSVTemplate[type]();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template_${type}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Modèle CSV téléchargé');
  };

  const resetModal = () => {
    setCsvData([]);
    setErrors([]);
    setStep('upload');
  };

  const closeModal = () => {
    setShowModal(false);
    resetModal();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={disabled}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Upload className="h-4 w-4" />
        <span>Importer CSV</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-zinc-800">
                Importer {typeLabels[type]}
              </h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {step === 'upload' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-3">
                      Étape 1 : Télécharger le modèle CSV
                    </h3>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger Modèle</span>
                    </button>
                    <p className="text-sm text-blue-600 mt-2">
                      Remplissez le modèle avec vos données, puis importez-le ci-dessous
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-3">
                      Étape 2 : Importer votre fichier CSV
                    </h3>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="w-full p-2 border border-green-300 rounded-lg"
                    />
                    <p className="text-sm text-green-600 mt-2">
                      Sélectionnez votre fichier CSV rempli
                    </p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                    <h4 className="font-medium text-zinc-800 mb-2">Format requis pour {typeLabels[type]} :</h4>
                    {type === 'products' && (
                      <ul className="text-sm text-zinc-600 space-y-1">
                        <li>• <strong>Nom</strong> : Nom du produit (obligatoire)</li>
                        <li>• <strong>Prix</strong> : Prix en euros (obligatoire)</li>
                        <li>• <strong>Catégorie</strong> : Nom de la catégorie (obligatoire)</li>
                        <li>• <strong>Retrait Planifié</strong> : oui/non</li>
                        <li>• <strong>Délai Retrait</strong> : "X jours" ou "X heures"</li>
                        <li>• <strong>URL Image</strong> : Lien vers l'image (optionnel)</li>
                        <li>• <strong>Actif</strong> : oui/non</li>
                      </ul>
                    )}
                    {type === 'categories' && (
                      <ul className="text-sm text-zinc-600 space-y-1">
                        <li>• <strong>Nom</strong> : Nom de la catégorie (obligatoire)</li>
                        <li>• <strong>Description</strong> : Description (optionnel)</li>
                        <li>• <strong>Active</strong> : oui/non</li>
                      </ul>
                    )}
                    {type === 'users' && (
                      <ul className="text-sm text-zinc-600 space-y-1">
                        <li>• <strong>Email</strong> : Adresse email (obligatoire)</li>
                        <li>• <strong>Nom</strong> : Nom complet (optionnel)</li>
                        <li>• <strong>Téléphone</strong> : Numéro de téléphone (optionnel)</li>
                        <li>• <strong>Rôle</strong> : user ou admin</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {step === 'validate' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    {errors.length === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    )}
                    <h3 className="font-medium text-zinc-800">
                      Validation du fichier CSV
                    </h3>
                  </div>

                  {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">Erreurs détectées :</h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                      <p className="text-sm text-red-600 mt-2">
                        Corrigez ces erreurs dans votre fichier et réessayez
                      </p>
                    </div>
                  )}

                  {csvData.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">
                        {csvData.length} {typeLabels[type].toLowerCase()} prêt(s) à importer
                      </h4>
                      <div className="max-h-40 overflow-y-auto bg-white rounded p-2 text-xs">
                        {csvData.slice(0, 5).map((item, index) => (
                          <div key={index} className="border-b border-zinc-100 py-1">
                            {type === 'products' && `${item.nom} - ${item.prix}€ - ${item.categorie}`}
                            {type === 'categories' && `${item.nom}${item.description ? ` - ${item.description}` : ''}`}
                            {type === 'users' && `${item.email} - ${item.name} - ${item.role}`}
                          </div>
                        ))}
                        {csvData.length > 5 && (
                          <div className="text-zinc-500 py-1">... et {csvData.length - 5} autres</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <button
                      onClick={() => setStep('upload')}
                      className="px-4 py-2 text-zinc-600 hover:text-zinc-800"
                    >
                      Retour
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 text-zinc-600 hover:text-zinc-800"
                      >
                        Annuler
                      </button>
                      {csvData.length > 0 && (
                        <button
                          onClick={handleImport}
                          disabled={isProcessing}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {isProcessing ? 'Import en cours...' : `Importer ${csvData.length} éléments`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportButton;