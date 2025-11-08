export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Échapper les guillemets et encapsuler les valeurs avec des virgules
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

export const exportToTXT = (data: any[], filename: string) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const maxLengths = headers.map(header => 
    Math.max(
      header.length,
      ...data.map(row => String(row[header] ?? '').length)
    )
  );

  const headerRow = headers.map((header, i) => header.padEnd(maxLengths[i])).join(' | ');
  const separator = maxLengths.map(length => '-'.repeat(length)).join('-+-');
  
  const dataRows = data.map(row =>
    headers.map((header, i) => 
      String(row[header] ?? '').padEnd(maxLengths[i])
    ).join(' | ')
  );

  const txtContent = [headerRow, separator, ...dataRows].join('\n');
  downloadFile(txtContent, `${filename}.txt`, 'text/plain');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatDataForExport = {
  products: (products: any[]) => products.map(product => ({
    'ID': product.id,
    'Nom': product.nom,
    'Prix': `${product.prix}€`,
    'Catégorie': product.categorie,
    'Retrait Planifié': product.retrait_planifie ? 'Oui' : 'Non',
    'Délai Retrait': product.retrait_planifie ? 
      `${product.delai_retrait_valeur || 4} ${product.delai_retrait_unite || 'jours'}` : 'N/A',
    'Actif': product.actif ? 'Oui' : 'Non',
    'URL Image': product.image_url || '',
    'Créé le': new Date(product.created_at).toLocaleDateString('fr-FR'),
    'Modifié le': new Date(product.updated_at).toLocaleDateString('fr-FR')
  })),

  categories: (categories: any[], productCounts: Record<string, number> = {}) => categories.map(category => ({
    'ID': category.id,
    'Nom': category.nom,
    'Description': category.description || '',
    'Nombre de Produits': productCounts[category.nom] || 0,
    'Active': category.actif ? 'Oui' : 'Non',
    'Créée le': new Date(category.created_at).toLocaleDateString('fr-FR'),
    'Modifiée le': new Date(category.updated_at).toLocaleDateString('fr-FR')
  })),

  users: (users: any[]) => users.map(user => ({
    'ID': user.id,
    'Email': user.email,
    'Rôle': user.role || 'user',
    'Nom': user.full_name || '',
    'Téléphone': user.phone || '',
    'Créé le': new Date(user.created_at).toLocaleDateString('fr-FR'),
    'Modifié le': new Date(user.updated_at).toLocaleDateString('fr-FR')
  })),

  orders: (orders: any[]) => orders.map(order => ({
    'ID': order.id,
    'Client': order.client_name || order.user_email,
    'Email': order.user_email,
    'Téléphone': order.phone || '',
    'Total': `${order.total}€`,
    'Statut': order.status,
    'Date Retrait': order.pickup_date ? 
      new Date(order.pickup_date).toLocaleDateString('fr-FR') : 'Non spécifiée',
    'Créée le': new Date(order.created_at).toLocaleDateString('fr-FR'),
    'Items': order.items ? 
      order.items.map((item: any) => `${item.product_name} x${item.quantity}`).join('; ') : ''
  }))
};