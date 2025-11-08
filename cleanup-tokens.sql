-- Voir tous les tokens actuels
SELECT id, user_email, device_id, fcm_token, created_at 
FROM user_fcm_tokens 
ORDER BY created_at DESC;

-- Supprimer tous les tokens (pour recommencer à zéro)
-- DELETE FROM user_fcm_tokens;
