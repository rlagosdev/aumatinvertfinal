import React, { useState } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeOption {
  id: string;
  label: string;
  url: string;
  description: string;
}

const QRCodeGenerator: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('home');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;

  const qrOptions: QRCodeOption[] = [
    {
      id: 'home',
      label: 'Page d\'Accueil',
      url: baseUrl,
      description: 'QR code pour la page d\'accueil de votre site'
    },
    {
      id: 'products',
      label: 'Page Produits',
      url: `${baseUrl}/products`,
      description: 'QR code pour accéder directement à vos produits'
    },
    {
      id: 'about',
      label: 'Page À Propos',
      url: `${baseUrl}/about`,
      description: 'QR code pour en savoir plus sur votre entreprise'
    },
    {
      id: 'contact',
      label: 'Page Contact',
      url: `${baseUrl}/contact`,
      description: 'QR code pour la page de contact'
    },
    {
      id: 'events',
      label: 'Page Événements',
      url: `${baseUrl}/events`,
      description: 'QR code pour voir vos événements'
    }
  ];

  const generateQRCode = async (url: string) => {
    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: url,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 5
      },
      dotsOptions: {
        color: '#9333ea', // purple-600
        type: 'rounded'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      cornersSquareOptions: {
        color: '#9333ea',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#a855f7', // purple-500
        type: 'dot'
      }
    });

    // Convert to data URL
    const blob = await qrCode.getRawData('png');
    if (blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeDataUrl(reader.result as string);
      };
      reader.readAsDataURL(blob);
    }
  };

  const handleGenerateQR = () => {
    const option = qrOptions.find(opt => opt.id === selectedOption);
    if (option) {
      generateQRCode(option.url);
      toast.success(`QR Code généré pour: ${option.label}`);
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl) {
      toast.error('Veuillez générer un QR code d\'abord');
      return;
    }

    const link = document.createElement('a');
    const option = qrOptions.find(opt => opt.id === selectedOption);
    link.download = `qr-code-${selectedOption}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    toast.success('QR Code téléchargé !');
  };

  const handleCopyImage = async () => {
    if (!qrCodeDataUrl) {
      toast.error('Veuillez générer un QR code d\'abord');
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setCopied(true);
      toast.success('Image copiée dans le presse-papier !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying image:', error);
      toast.error('Erreur lors de la copie de l\'image');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <QrCode className="h-5 w-5 text-purple-600" />
        <h2 className="text-xl font-semibold text-zinc-800">Générateur de Code QR</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Options */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-3">
              Sélectionnez une page
            </label>
            <div className="space-y-2">
              {qrOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="qr-option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-zinc-800">{option.label}</p>
                    <p className="text-sm text-zinc-600">{option.description}</p>
                    <p className="text-xs text-zinc-500 mt-1 font-mono">{option.url}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateQR}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all"
          >
            <QrCode className="h-5 w-5" />
            Générer le QR Code
          </button>
        </div>

        {/* Right: Preview & Download */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-3">
              Aperçu du QR Code
            </label>
            <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 bg-zinc-50 flex items-center justify-center min-h-[350px]">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="text-center text-zinc-400">
                  <QrCode className="h-16 w-16 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez une page et cliquez sur "Générer"</p>
                </div>
              )}
            </div>
          </div>

          {qrCodeDataUrl && (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                Télécharger
              </button>
              <button
                onClick={handleCopyImage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copier
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 mb-2">
          <strong>💡 Utilisations des QR Codes :</strong>
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Imprimez-les sur vos flyers, cartes de visite ou affiches</li>
          <li>• Affichez-les en vitrine pour diriger les clients vers votre site</li>
          <li>• Partagez-les sur les réseaux sociaux</li>
          <li>• Ajoutez-les à vos emails de newsletter</li>
          <li>• Intégrez-les dans vos supports marketing physiques</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>⚙️ Personnalisation :</strong> Les QR codes sont générés avec les couleurs de votre marque (violet/rose).
          Format haute résolution 300x300px, adapté à l'impression.
        </p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
