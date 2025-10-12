#!/usr/bin/env python3
"""
Script per convertire il file di testo dei dipinti in formato JSON
Uso: python convert_paintings.py input.txt output.json
"""

import json
import sys
import re
from datetime import datetime

def parse_painting_block(lines, language):
    """Estrae i dati di un dipinto da un blocco di righe"""
    data = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('ID:'):
            data['id'] = int(line.split(':', 1)[1].strip())
        elif line.startswith('DATA PUBBLICAZIONE:') or line.startswith('PUBLICATION DATE:'):
            date_str = line.split(':', 1)[1].strip()
            # Converti la data in formato ISO (YYYY-MM-DD)
            try:
                date_obj = datetime.strptime(date_str, '%b %d, %Y')
                data['publicationDate'] = date_obj.strftime('%Y-%m-%d')
            except:
                data['publicationDate'] = date_str
        elif line.startswith('TITOLO:') or line.startswith('TITLE:'):
            data['title'] = line.split(':', 1)[1].strip().strip('"')
        elif line.startswith('TECNICA:') or line.startswith('TECHNIQUE:'):
            data['technique'] = line.split(':', 1)[1].strip()
        elif line.startswith('DIMENSIONI:') or line.startswith('SIZE:'):
            data['dimensions'] = line.split(':', 1)[1].strip()
        elif line.startswith('DESCRIZIONE:') or line.startswith('DESCRIPTION:'):
            data['description'] = line.split(':', 1)[1].strip()
        elif line.startswith('LINK IMMAGINE:') or line.startswith('LINK IMAGE:'):
            data['image'] = line.split(':', 1)[1].strip()
        elif line.startswith('CATEGORIA:') or line.startswith('CATEGORY:'):
            data['category'] = line.split(':', 1)[1].strip()
        elif line.startswith('PREZZO:') or line.startswith('PRICE:'):
            price_str = line.split(':', 1)[1].strip()
            # Rimuovi il simbolo € e converti in numero
            price_str = price_str.replace('€', '').strip()
            try:
                data['price'] = int(price_str)
            except:
                data['price'] = price_str
    
    return data

def convert_txt_to_json(input_file, output_file):
    """Converte il file di testo in JSON"""
    # Prova diverse codifiche
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'mac-roman']
    content = None
    used_encoding = None
    
    for encoding in encodings:
        try:
            with open(input_file, 'r', encoding=encoding) as f:
                content = f.read()
            used_encoding = encoding
            print(f"📖 File letto con codifica: {encoding}")
            break
        except UnicodeDecodeError:
            continue
    
    if content is None:
        raise ValueError("Impossibile leggere il file. Nessuna codifica supportata ha funzionato.")
    
    # Pulizia caratteri problematici
    replacements = {
        'Ò': '"',  # Virgoletta aperta storta
        'Ó': '"',  # Virgoletta chiusa storta
        'È': 'È',  # E con accento
        ''': "'",  # Apostrofo curvo
        ''': "'",  # Apostrofo curvo alternativo
        '"': '"',  # Virgoletta doppia curva aperta
        '"': '"',  # Virgoletta doppia curva chiusa
        '–': '-',  # En dash
        '—': '-',  # Em dash
        '…': '...',  # Ellipsis
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    print(f"🧹 Caratteri speciali puliti")
    
    # Dividi il contenuto per i blocchi di dipinti (separati da ---)
    blocks = content.split('---')
    
    paintings = {}
    current_id = None
    
    for i, block in enumerate(blocks):
        lines = block.strip().split('\n')
        if not lines or not any(line.strip() for line in lines):
            continue
        
        # Determina se è italiano o inglese dal primo blocco
        is_italian = i % 2 == 0
        language = 'it' if is_italian else 'en'
        
        data = parse_painting_block(lines, language)
        
        if 'id' not in data:
            continue
        
        painting_id = data['id']
        
        # Se è il blocco italiano, crea una nuova entry
        if is_italian:
            current_id = painting_id
            paintings[current_id] = {
                'id': painting_id,
                'publicationDate': data.get('publicationDate', ''),
                'title': {'it': data.get('title', ''), 'en': ''},
                'technique': {'it': data.get('technique', ''), 'en': ''},
                'category': data.get('category', ''),
                'price': data.get('price', 0),
                'dimensions': data.get('dimensions', ''),
                'description': {'it': data.get('description', ''), 'en': ''},
                'image': data.get('image', '')
            }
        # Se è il blocco inglese, aggiungi alla entry esistente
        else:
            if current_id and current_id in paintings:
                paintings[current_id]['title']['en'] = data.get('title', '')
                paintings[current_id]['technique']['en'] = data.get('technique', '')
                paintings[current_id]['description']['en'] = data.get('description', '')
    
    # Converti il dizionario in una lista
    paintings_list = list(paintings.values())
    
    # Scrivi il JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(paintings_list, f, ensure_ascii=False, indent=4)
    
    print(f"✅ Conversione completata! {len(paintings_list)} dipinti salvati in {output_file}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python convert_paintings.py input.txt output.json")
        print("\nEsempio:")
        print("  python convert_paintings.py paintings.txt Paintings.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        convert_txt_to_json(input_file, output_file)
    except Exception as e:
        print(f"❌ Errore durante la conversione: {e}")
        sys.exit(1)
