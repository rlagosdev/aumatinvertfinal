-- Add description column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment to the column
COMMENT ON COLUMN products.description IS 'Description détaillée du produit visible côté client';
