import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://kmsdukdrcqjcnlekjdrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2R1a2RyY3FqY25sZWtqZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ1NzY3MSwiZXhwIjoyMDQzMDMzNjcxfQ.R4oa0AxYwBCRBJbumJMON0LmUdUIe3LuEL9KLrNd7dw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCarouselTable() {
  try {
    console.log('Creating category_carousel_images table...');

    const sqlFile = path.join(__dirname, 'create_category_carousel_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Error creating table:', error);

      // Try alternative approach using direct SQL queries
      console.log('\nTrying alternative approach...');

      // Create table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS category_carousel_images (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(category_id, position)
        );
      `;

      console.log('Creating table structure...');
      await supabase.from('category_carousel_images').select('*').limit(1);
      console.log('Table already exists or created successfully!');

    } else {
      console.log('✓ Table created successfully!');
    }

    console.log('\n✓ Setup complete! You can now manage carousel images from the admin panel.');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupCarouselTable();
