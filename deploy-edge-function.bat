@echo off
echo ================================
echo Deploiement Edge Function
echo ================================
echo.

set SUPABASE_ACCESS_TOKEN=sbp_6aa56dd55329fa10d7b4c36c9f3a16472365a5e2

echo Deploiement de send-notification...
npx supabase functions deploy send-notification --project-ref ypqhmhyqcydpbmgltqwl

echo.
echo ================================
echo Deploiement termine
echo ================================
pause
