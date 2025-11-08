-- Script SQL pour créer la table de paramètres du site
-- Exécuter ce script dans Supabase SQL Editor

-- Supprimer la table si elle existe déjà
DROP TABLE IF EXISTS public.site_settings;

-- Créer la table site_settings
CREATE TABLE public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) NOT NULL DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les paramètres par défaut
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
-- Images du carrousel (images par défaut)
('carousel_image_1', 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 'image_url', 'Première image du carrousel d''accueil'),
('carousel_image_2', 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 'image_url', 'Deuxième image du carrousel d''accueil'),
('carousel_image_3', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 'image_url', 'Troisième image du carrousel d''accueil'),

-- Logo
('logo_image', 'https://images.unsplash.com/photo-1518636744428-8e98b26e57d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'image_url', 'Image du logo de l''entreprise'),

-- Couleurs du thème (couleurs actuelles du site)
('color_primary', '#9333ea', 'color', 'Couleur de base'),
('color_background', '#ffffff', 'color', 'Couleur d''arrière-plan du corps'),
('color_text_dark', '#374151', 'color', 'Couleur de police foncée'),
('color_text_light', '#ffffff', 'color', 'Couleur de police claire'),
('color_buttons', '#a855f7', 'color', 'Couleur des boutons'),
('color_company_title', '#1f2937', 'color', 'Couleur du titre de l''entreprise'),
('color_slot_occupied', '#fca5a5', 'color', 'Couleur créneau occupé'),
('color_slot_available', '#93c5fd', 'color', 'Couleur créneau disponible');

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();

-- Activer RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access to site settings" ON public.site_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre la modification aux administrateurs seulement
CREATE POLICY "Allow admin to modify site settings" ON public.site_settings
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Index pour optimiser les requêtes
CREATE INDEX idx_site_settings_key ON public.site_settings(setting_key);

-- Commentaires pour la documentation
COMMENT ON TABLE public.site_settings IS 'Paramètres de configuration du site (couleurs, images, etc.)';
COMMENT ON COLUMN public.site_settings.setting_key IS 'Clé unique identifiant le paramètre';
COMMENT ON COLUMN public.site_settings.setting_value IS 'Valeur du paramètre';
COMMENT ON COLUMN public.site_settings.setting_type IS 'Type de paramètre (color, image_url, text, etc.)';
COMMENT ON COLUMN public.site_settings.description IS 'Description du paramètre';