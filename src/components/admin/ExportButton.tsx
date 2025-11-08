import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { exportToCSV, exportToTXT } from '../../utils/exportUtils';
import { toast } from 'react-toastify';

interface ExportButtonProps {
  data: any[];
  filename: string;
  label?: string;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  filename, 
  label = "Exporter",
  disabled = false 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExportCSV = () => {
    if (!data.length) {
      toast.warning('Aucune donnée à exporter');
      return;
    }
    exportToCSV(data, `${filename}_${new Date().toISOString().split('T')[0]}`);
    toast.success('Export CSV téléchargé');
    setShowDropdown(false);
  };

  const handleExportTXT = () => {
    if (!data.length) {
      toast.warning('Aucune donnée à exporter');
      return;
    }
    exportToTXT(data, `${filename}_${new Date().toISOString().split('T')[0]}`);
    toast.success('Export TXT téléchargé');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled}
        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>{label}</span>
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 z-20">
            <div className="py-1">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center space-x-2"
              >
                <Table className="h-4 w-4 text-green-600" />
                <span>Exporter en CSV</span>
              </button>
              <button
                onClick={handleExportTXT}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center space-x-2"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Exporter en TXT</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;