<?php
echo "Le dossier mail fonctionne !<br>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script Filename: " . $_SERVER['SCRIPT_FILENAME'] . "<br>";

// Test si index.php existe
if (file_exists('index.php')) {
    echo "<br><strong style='color: green;'>✓ index.php existe dans ce dossier</strong><br>";
} else {
    echo "<br><strong style='color: red;'>✗ index.php n'existe PAS dans ce dossier</strong><br>";
}

// Liste les fichiers
echo "<br><strong>Fichiers présents :</strong><br>";
$files = scandir('.');
foreach ($files as $file) {
    if ($file != '.' && $file != '..') {
        echo "- $file<br>";
    }
}
?>
