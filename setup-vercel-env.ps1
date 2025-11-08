# Script pour configurer les variables d'environnement Vercel
# Exécuter dans PowerShell

Write-Host "🚀 Configuration des variables d'environnement Vercel..." -ForegroundColor Green
Write-Host ""

$envVars = @{
    "VITE_SUPABASE_URL" = "https://bvvekjhvmorgdvleobdo.supabase.co"
    "VITE_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM"
    "VITE_SUPABASE_PUBLISHABLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM"
    "VITE_FACEBOOK_APP_ID" = "801122365840416"
    "VITE_FACEBOOK_APP_SECRET" = "4b6aaefca0cf76ca1ad65c6041846ee6"
    "VITE_FACEBOOK_REDIRECT_URI" = "https://project-67nk4o97k-lagoss-projects-85f0b924.vercel.app/api/auth/facebook/callback"
    "VITE_STRIPE_PUBLISHABLE_KEY" = "pk_test_51QOzt4P4zAs7dGDQEFzQDG0c9ijJCINy9xgVoWUcxAZdKZpIGHe4ItFyDxz8yPjmHaZhbhS7tNK7zzYX9NObCDaO00s3hKMJlT"
    "VITE_EMAILJS_PUBLIC_KEY" = "hpEiHp2M9ELyMjCJm"
    "VITE_EMAILJS_ORDER_SERVICE_ID" = "service_618g1x9"
    "VITE_EMAILJS_ORDER_TEMPLATE_ID" = "template_wiqn6fa"
    "VITE_EMAILJS_VENDOR_SERVICE_ID" = "service_618g1x9"
    "VITE_EMAILJS_VENDOR_TEMPLATE_ID" = "template_wiqn6fa"
    "VITE_VENDOR_EMAIL" = "contact@aumatinvert.fr"
    "VITE_FIREBASE_API_KEY" = "AIzaSyDDhIDfXxIUuyR_CY2Pi9nH9FsP5dW7-fc"
    "VITE_FIREBASE_AUTH_DOMAIN" = "au-matin-vert.firebaseapp.com"
    "VITE_FIREBASE_PROJECT_ID" = "au-matin-vert"
    "VITE_FIREBASE_STORAGE_BUCKET" = "au-matin-vert.firebasestorage.app"
    "VITE_FIREBASE_MESSAGING_SENDER_ID" = "697849274497"
    "VITE_FIREBASE_APP_ID" = "1:697849274497:web:94061215628a011e052d80"
    "VITE_FIREBASE_VAPID_KEY" = "BBPw8HBh2SlI8GeNzJkVcgkQl61BaGQ358eVmPKQqytGEKHngZibuJ7Xb2WYzN_qiAfraA8mVhIfjt9SXS0V9H0"
}

$totalVars = $envVars.Count
$currentVar = 0

foreach ($key in $envVars.Keys) {
    $currentVar++
    $value = $envVars[$key]

    Write-Host "[$currentVar/$totalVars] Ajout de $key..." -ForegroundColor Cyan

    # Créer un fichier temporaire avec la valeur
    $tempFile = New-TemporaryFile
    Set-Content -Path $tempFile.FullName -Value $value -NoNewline

    # Ajouter la variable d'environnement
    $result = cmd /c "vercel env add $key production < `"$($tempFile.FullName)`" 2>&1"

    # Supprimer le fichier temporaire
    Remove-Item $tempFile.FullName

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $key ajouté avec succès" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $key : $result" -ForegroundColor Yellow
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Maintenant, redéploie le site avec:" -ForegroundColor Yellow
Write-Host "   vercel --prod" -ForegroundColor White
Write-Host ""
