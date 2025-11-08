import json
import requests
import os
from pathlib import Path

TOKEN = "VynhRTS3XLVnnYOsKASMrNT9"
DEPLOYMENT_ID = "dpl_Fd7f2gEYB9RAZPe1VzQfesAR4KPn"
OUTPUT_DIR = r"C:\Users\rlago\Downloads\site nouveau\project\aumatinvertfinal"

def download_file(uid, file_path):
    """Télécharge un fichier depuis Vercel"""
    url = f"https://api.vercel.com/v13/deployments/{DEPLOYMENT_ID}/files/{uid}"
    headers = {"Authorization": f"Bearer {TOKEN}"}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        full_path = os.path.join(OUTPUT_DIR, file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, 'wb') as f:
            f.write(response.content)
        print(f"OK {file_path}")
        return True
    else:
        print(f"ERROR {file_path} - Error {response.status_code}")
        return False

def process_directory(items, current_path=""):
    """Traite récursivement les fichiers et dossiers"""
    for item in items:
        item_path = os.path.join(current_path, item['name']) if current_path else item['name']

        if item['type'] == 'file':
            download_file(item['uid'], item_path)
        elif item['type'] == 'directory' and 'children' in item:
            process_directory(item['children'], item_path)

# Charge la liste des fichiers
with open(os.path.join(OUTPUT_DIR, 'files.json'), 'r', encoding='utf-8') as f:
    files = json.load(f)

print("Téléchargement des fichiers depuis Vercel...")
print("=" * 50)

# Trouve le dossier src
for item in files:
    if item['name'] == 'src' and item['type'] == 'directory':
        process_directory(item['children'], 'src')
        break

# Télécharge aussi les fichiers à la racine du projet
root_files = ['package.json', 'vite.config.ts', 'tsconfig.json', 'index.html', 'README.md', '.gitignore']
for root_file in root_files:
    for item in files:
        if item['name'] == 'src' and item['type'] == 'directory':
            # Cherche dans la racine
            pass

print("=" * 50)
print("Téléchargement terminé!")
