export const parseCSV = (csvText: string): any[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((header: string) => header.trim().replace(/"/g, ''));
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header: string, index: number) => {
        row[header] = values[index].trim().replace(/"/g, '');
      });
      data.push(row);
    }
  }

  return data;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

export const validateImportData = {
  products: (data: any[]) => {
    const errors: string[] = [];
    const validData: any[] = [];

    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Validation nom (obligatoire)
      if (!row['Nom'] || row['Nom'].trim() === '') {
        rowErrors.push('Nom obligatoire');
      }

      // Validation prix (obligatoire, numérique)
      const prix = parseFloat(row['Prix']?.replace('€', '').trim());
      if (isNaN(prix) || prix < 0) {
        rowErrors.push('Prix invalide (doit être un nombre positif)');
      }

      // Validation catégorie (obligatoire)
      if (!row['Catégorie'] || row['Catégorie'].trim() === '') {
        rowErrors.push('Catégorie obligatoire');
      }

      // Validation retrait planifié (booléen)
      const retraitPlanifie = ['oui', 'yes', 'true', '1'].includes(row['Retrait Planifié']?.toLowerCase()?.trim());
      
      // Validation délai si retrait planifié
      let delaiValeur = 4;
      let delaiUnite = 'jours';
      if (retraitPlanifie && row['Délai Retrait']) {
        const delaiMatch = row['Délai Retrait'].match(/(\d+)\s*(heures?|jours?)/i);
        if (delaiMatch) {
          delaiValeur = parseInt(delaiMatch[1]);
          delaiUnite = delaiMatch[2].toLowerCase().includes('heure') ? 'heures' : 'jours';
        }
      }

      // Validation actif (booléen)
      const actif = !['non', 'no', 'false', '0'].includes(row['Actif']?.toLowerCase()?.trim());

      if (rowErrors.length > 0) {
        errors.push(`Ligne ${index + 2}: ${rowErrors.join(', ')}`);
      } else {
        validData.push({
          nom: row['Nom'].trim(),
          prix: prix,
          categorie: row['Catégorie'].trim(),
          retrait_planifie: retraitPlanifie,
          delai_retrait_valeur: delaiValeur,
          delai_retrait_unite: delaiUnite,
          image_url: row['URL Image']?.trim() || '',
          actif: actif
        });
      }
    });

    return { errors, validData };
  },

  categories: (data: any[]) => {
    const errors: string[] = [];
    const validData: any[] = [];

    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Validation nom (obligatoire)
      if (!row['Nom'] || row['Nom'].trim() === '') {
        rowErrors.push('Nom obligatoire');
      }

      // Validation actif (booléen)
      const actif = !['non', 'no', 'false', '0'].includes(row['Active']?.toLowerCase()?.trim());

      if (rowErrors.length > 0) {
        errors.push(`Ligne ${index + 2}: ${rowErrors.join(', ')}`);
      } else {
        validData.push({
          nom: row['Nom'].trim(),
          description: row['Description']?.trim() || null,
          actif: actif
        });
      }
    });

    return { errors, validData };
  },

  users: (data: any[]) => {
    const errors: string[] = [];
    const validData: any[] = [];

    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Validation email (obligatoire, format email)
      const email = row['Email']?.trim();
      if (!email) {
        rowErrors.push('Email obligatoire');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrors.push('Format email invalide');
      }

      // Validation rôle
      const role = row['Rôle']?.toLowerCase()?.trim();
      const validRoles = ['user', 'admin'];
      const finalRole = validRoles.includes(role) ? role : 'user';

      if (rowErrors.length > 0) {
        errors.push(`Ligne ${index + 2}: ${rowErrors.join(', ')}`);
      } else {
        validData.push({
          email: email.toLowerCase(),
          name: row['Nom']?.trim() || '',
          phone: row['Téléphone']?.trim() || '',
          role: finalRole
        });
      }
    });

    return { errors, validData };
  }
};

export const generateCSVTemplate = {
  products: () => {
    const headers = ['Nom', 'Prix', 'Catégorie', 'Retrait Planifié', 'Délai Retrait', 'URL Image', 'Actif'];
    const example = ['Produit Exemple', '15.99', 'Fruits', 'oui', '2 jours', 'https://exemple.com/image.jpg', 'oui'];
    
    return [headers.join(','), example.join(',')].join('\n');
  },

  categories: () => {
    const headers = ['Nom', 'Description', 'Active'];
    const example = ['Nouvelle Catégorie', 'Description optionnelle', 'oui'];
    
    return [headers.join(','), example.join(',')].join('\n');
  },

  users: () => {
    const headers = ['Email', 'Nom', 'Téléphone', 'Rôle'];
    const example = ['user@exemple.com', 'Nom Utilisateur', '0123456789', 'user'];
    
    return [headers.join(','), example.join(',')].join('\n');
  }
};