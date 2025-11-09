import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadVideo() {
  console.log('📹 Upload de la vidéo hero mobile sans bandes noires...\n');

  try {
    // Lire le fichier vidéo
    const videoPath = 'C:\\Users\\rlago\\Downloads\\hero_video_mobile_no_bars.mp4';
    const videoBuffer = fs.readFileSync(videoPath);
    const fileName = `video-${Date.now()}.mp4`;
    const filePath = `videos/${fileName}`;

    console.log('📤 Upload en cours...');

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('images-produits')
      .upload(filePath, videoBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('images-produits')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    console.log('✅ Vidéo uploadée avec succès !');
    console.log('📍 URL:', publicUrl);

    // Mettre à jour le paramètre hero_video_url_mobile dans site_settings
    console.log('\n🔧 Mise à jour de la configuration...');

    const { error: updateError } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'hero_video_url_mobile',
        setting_value: publicUrl,
        description: 'URL de la vidéo hero pour mobile (sans bandes noires)'
      });

    if (updateError) {
      console.error('⚠️ Erreur lors de la mise à jour de la configuration:', updateError);
    } else {
      console.log('✅ Configuration mise à jour !');
    }

    console.log('\n🎉 Terminé ! Rechargez votre site mobile pour voir la nouvelle vidéo.');

  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

uploadVideo().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
