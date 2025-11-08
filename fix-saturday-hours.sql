-- Corriger les horaires du samedi (manque le matin)
UPDATE site_settings 
SET setting_value = '{"day":"Samedi","isOpen":true,"morning":{"open":"08:00","close":"13:00"},"afternoon":{"open":"15:30","close":"19:00"}}'
WHERE setting_key = 'opening_hours_saturday';