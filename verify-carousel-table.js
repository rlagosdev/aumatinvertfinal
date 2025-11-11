import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmsdukdrcqjcnlekjdrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2R1a2RyY3FqY25sZWtqZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ1NzY3MSwiZXhwIjoyMDQzMDMzNjcxfQ.R4oa0AxYwBCRBJbumJMON0LmUdUIe3LuEL9KLrNd7dw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTable() {
  try {
    console.log('Checking if category_carousel_images table exists...');

    const { data, error } = await supabase
      .from('category_carousel_images')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('✗ Table does not exist. You need to create it manually in Supabase SQL Editor.');
        console.log('\nPlease run the SQL from create_category_carousel_table.sql in your Supabase SQL Editor.');
        return;
      }
      console.error('Error:', error);
      return;
    }

    console.log('✓ Table exists and is accessible!');
    console.log(`Current records: ${data?.length || 0}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyTable();
