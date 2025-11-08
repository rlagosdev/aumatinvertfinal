import json
import requests
import os
from pathlib import Path
import time

TOKEN = "VynhRTS3XLVnnYOsKASMrNT9"
# Utiliser le déploiement qui fonctionne (le précédent)
DEPLOYMENT_ID = "dpl_DRN2d6mYAf45cQSxnf8Qd6MSALbx"
OUTPUT_DIR = r"C:\Users\rlago\Downloads\site nouveau\project\aumatinvert-source"

# Créer le dossier de sortie
os.makedirs(OUTPUT_DIR, exist_ok=True)

def download_file_content(uid):
    """Télécharge le contenu d'un fichier depuis Vercel"""
    # Utiliser l'endpoint correct pour télécharger le contenu du fichier
    url = f"https://api.vercel.com/v2/now/files/{uid}"
    headers = {"Authorization": f"Bearer {TOKEN}"}

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.content
        else:
            print(f"    ERROR: Status {response.status_code}")
            return None
    except Exception as e:
        print(f"    ERROR: {e}")
        return None

def download_file(uid, file_path):
    """Télécharge et sauvegarde un fichier"""
    content = download_file_content(uid)

    if content:
        full_path = os.path.join(OUTPUT_DIR, file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, 'wb') as f:
            f.write(content)
        print(f"OK: {file_path}")
        return True
    else:
        print(f"SKIP: {file_path}")
        return False

def process_directory(items, current_path="", stats=None):
    """Traite récursivement les fichiers et dossiers"""
    if stats is None:
        stats = {"success": 0, "failed": 0}

    for item in items:
        item_path = os.path.join(current_path, item['name']) if current_path else item['name']

        if item['type'] == 'file':
            if download_file(item['uid'], item_path):
                stats["success"] += 1
            else:
                stats["failed"] += 1
            time.sleep(0.1)  # Petit délai pour éviter de surcharger l'API
        elif item['type'] == 'directory' and 'children' in item:
            print(f"\nDossier: {item_path}/")
            process_directory(item['children'], item_path, stats)

    return stats

# Charge la liste des fichiers depuis le fichier JSON existant
files_json_path = r"C:\Users\rlago\Downloads\site nouveau\project\aumatinvertfinal\files.json"

if not os.path.exists(files_json_path):
    print("Téléchargement de la liste des fichiers...")
    # Télécharger la liste des fichiers
    url = f"https://api.vercel.com/v13/deployments/{DEPLOYMENT_ID}/files"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        files = response.json()
        with open(files_json_path, 'w', encoding='utf-8') as f:
            json.dump(files, f, indent=2)
    else:
        print(f"Erreur lors de la récupération de la liste: {response.status_code}")
        exit(1)

print("Chargement de la liste des fichiers...")
with open(files_json_path, 'r', encoding='utf-8') as f:
    files = json.load(f)

print(f"\nTéléchargement vers: {OUTPUT_DIR}")
print("=" * 60)

stats = process_directory(files)

print("\n" + "=" * 60)
print(f"Téléchargement terminé!")
print(f"Réussis: {stats['success']}")
print(f"Échoués: {stats['failed']}")
print(f"\nLes fichiers sont dans: {OUTPUT_DIR}")
