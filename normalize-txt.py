#!/usr/bin/env python3
"""
Script per normalizzare il file paintings.txt
Rimuove caratteri problematici e standardizza il formato
Uso: python normalize_paintings.py input.txt output.txt
"""

import sys
import re

def normalize_file(input_file, output_file):
    """Normalizza il file di testo rimuovendo caratteri problematici"""
    
    # Leggi il file come bytes prima
    with open(input_file, 'rb') as f:
        raw_bytes = f.read()
    
    print(f"✓ File letto: {len(raw_bytes)} bytes")
    
    # Prova a decodificare con diverse codifiche
    content = None
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'mac-roman', 'windows-1252']
    
    for encoding in encodings:
        try:
            content = raw_bytes.decode(encoding)
            print(f"✓ File decodificato con: {encoding}")
            break
        except:
            continue
    
    if content is None:
        # Ultimo tentativo: forza latin-1 che legge sempre tutto
        content = raw_bytes.decode('latin-1', errors='replace')
        print(f"✓ File decodificato forzatamente con latin-1")
    
    # MAPPA DI CONVERSIONE ESTESA
    # Questi mappano i byte sbagliati ai caratteri giusti
    char_map = {
        # Apostrofo (priorità massima)
        'Õ': "'",
        'Ô': "'",
        ''': "'",
        ''': "'",
        '`': "'",
        
        # Euro
        'Û': '€',
        'â‚¬': '€',
        
        # Accenti - à
        'à': 'à',
        'Ã ': 'à',
        '\xc3\xa0': 'à',
        
        # Accenti - è  
        'è': 'è',
        'Ã¨': 'è',
        '\xc3\xa8': 'è',
        
        # Accenti - é
        'é': 'é',
        'Ã©': 'é',
        '\xc3\xa9': 'é',
        
        # Accenti - ì
        'ì': 'ì',
        'Ã¬': 'ì',
        '\xc3\xac': 'ì',
        
        # Accenti - ò
        'ò': 'ò',
        'Ã²': 'ò',
        '\xc3\xb2': 'ò',
        
        # Accenti - ù
        'ù': 'ù',
        'Ã¹': 'ù',
        '\xc3\xb9': 'ù',
        
        # Virgolette
        '"': '"',
        '"': '"',
        'Ò': '"',
        'Ó': '"',
        '«': '"',
        '»': '"',
        
        # Altri
        '–': '-',
        '—': '-',
        '…': '...',
    }
    
    # Applica conversioni multiple volte per essere sicuri
    for _ in range(3):
        for old, new in char_map.items():
            content = content.replace(old, new)
    
    print(f"✓ Caratteri speciali convertiti")
    
    # FIX SPECIFICI per pattern problematici
    # dell' + qualsiasi carattere strano -> dell'
    content = re.sub(r"dell[ÕÔ''`]", "dell'", content)
    content = re.sub(r"l[ÕÔ''`]", "l'", content)
    content = re.sub(r"L[ÕÔ''`]", "L'", content)
    content = re.sub(r"nell[ÕÔ''`]", "nell'", content)
    content = re.sub(r"all[ÕÔ''`]", "all'", content)
    content = re.sub(r"dall[ÕÔ''`]", "dall'", content)
    content = re.sub(r"un[ÕÔ''`]", "un'", content)
    
    # Fix per parole troncate (normalit -> normalità)
    # Cerca parole che finiscono con consonante + vocale senza accento prima di spazio/punto/virgola
    content = re.sub(r'\bnormalit([^àèéìòùa-z])', r'normalità\1', content)
    content = re.sub(r'\bcitt([^àèéìòùa-z])', r'città\1', content)
    content = re.sub(r'\bqualit([^àèéìòùa-z])', r'qualità\1', content)
    content = re.sub(r'\bverit([^àèéìòùa-z])', r'verità\1', content)
    content = re.sub(r'\bidentit([^àèéìòùa-z])', r'identità\1', content)
    
    print(f"✓ Pattern problematici corretti")
    
    # RIMUOVI VIRGOLETTE DAI TITOLI
    content = re.sub(r'(TITOLO:|TITLE:)\s*["""\']+\s*', r'\1 ', content)
    
    print(f"✓ Virgolette rimosse dai titoli")
    
    # NORMALIZZA SPAZI
    content = re.sub(r' +', ' ', content)
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # NORMALIZZA SEPARATORI
    content = re.sub(r'\n*---\n*', '\n---\n', content)
    
    # PULISCI FILE
    content = content.strip() + '\n'
    
    # Scrivi in UTF-8
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✓✓✓ File normalizzato salvato in: {output_file}")
    
    # Conta blocchi
    blocks = content.split('---')
    print(f"    Blocchi trovati: {len(blocks)}")
    print(f"    Dipinti attesi: {len(blocks) // 2}")
    
    # Verifica alcuni pattern
    print("\n🔍 Verifica rapida:")
    if "dell'" in content:
        print("    ✓ Apostrofi corretti trovati (dell')")
    if "€" in content:
        print("    ✓ Simbolo Euro trovato")
    if "normalità" in content:
        print("    ✓ Accento à trovato (normalità)")
    
    return True

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python normalize_paintings.py input.txt output.txt")
        print("\nEsempio:")
        print("  python normalize_paintings.py paintings.txt paintings_clean.txt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    success = normalize_file(input_file, output_file)
    
    if not success:
        print("\n✗ Normalizzazione fallita")
        sys.exit(1)
    else:
        print("\n✓ Ora puoi usare il file normalizzato:")
        print(f"  python3 convert_paintings.py {output_file} Paintings.json")
#!/usr/bin/env python3
"""
Script per normalizzare il file paintings.txt
Rimuove caratteri problematici e standardizza il formato
Uso: python normalize_paintings.py input.txt output.txt
"""

import sys
import re

def normalize_file(input_file, output_file):
    """Normalizza il file di testo rimuovendo caratteri problematici"""
    
    # Prova diverse codifiche per leggere
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'mac-roman']
    content = None
    used_encoding = None
    
    for encoding in encodings:
        try:
            with open(input_file, 'r', encoding=encoding) as f:
                content = f.read()
            used_encoding = encoding
            print(f"✓ File letto con codifica: {encoding}")
            break
        except:
            continue
    
    if content is None:
        print("✗ Impossibile leggere il file")
        return False
    
    print(f"✓ File letto: {len(content)} caratteri")
    
    # MAPPA DI CONVERSIONE CARATTERI (Latin-1 -> UTF-8)
    # Questi sono i caratteri che Latin-1 legge in modo sbagliato
    char_map = {
        # Accenti italiani
        'à': 'à',
        'è': 'è', 
        'é': 'é',
        'ì': 'ì',
        'ò': 'ò',
        'ù': 'ù',
        'À': 'À',
        'È': 'È',
        'É': 'É',
        'Ì': 'Ì',
        'Ò': 'Ò',
        'Ù': 'Ù',
        # Apostrofo
        'Õ': "'",  # Apostrofo codificato male
        # Euro
        'Û': '€',  # Simbolo euro codificato male
        '€': '€',  # Euro già corretto
        # Virgolette curve
        '"': '"',
        '"': '"',
        'Ò': '"',  # Virgoletta aperta storta
        'Ó': '"',  # Virgoletta chiusa storta
        ''': "'",
        ''': "'",
        # Altri simboli
        '–': '-',
        '—': '-',
        '…': '...',
        '¬': '',
    }
    
    # Applica la mappa di conversione
    for old, new in char_map.items():
        content = content.replace(old, new)
    
    print(f"✓ Caratteri speciali convertiti")
    
    # 1. RIMUOVI VIRGOLETTE DAI TITOLI (tutte le varianti)
    # Trova tutti i pattern TITOLO: o TITLE: e rimuovi le virgolette
    content = re.sub(r'(TITOLO:|TITLE:)\s*["""\']+\s*', r'\1 ', content)
    content = re.sub(r'([^\n]+)(TITOLO:|TITLE:)([^:\n]+)\n', 
                     lambda m: m.group(0).replace('"', '').replace("'", ''), 
                     content)
    
    print(f"✓ Virgolette rimosse dai titoli")
    
    # 2. NORMALIZZA SPAZI MULTIPLI
    content = re.sub(r' +', ' ', content)
    
    print(f"✓ Spazi normalizzati")
    
    # 3. NORMALIZZA SEPARATORI ---
    content = re.sub(r'\n*---\n*', '\n---\n', content)
    
    print(f"✓ Separatori normalizzati")
    
    # 4. RIMUOVI RIGHE VUOTE MULTIPLE
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    print(f"✓ Righe vuote ridotte")
    
    # 5. ASSICURA CHE IL FILE INIZI PULITO
    content = content.strip() + '\n'
    
    # Scrivi il file normalizzato in UTF-8
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✓✓✓ File normalizzato salvato in: {output_file}")
    print(f"    Caratteri finali: {len(content)}")
    
    # Conta i blocchi
    blocks = content.split('---')
    print(f"    Blocchi trovati: {len(blocks)}")
    print(f"    Dipinti attesi: {len(blocks) // 2}")
    
    return True

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python normalize_paintings.py input.txt output.txt")
        print("\nEsempio:")
        print("  python normalize_paintings.py paintings.txt paintings_clean.txt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    success = normalize_file(input_file, output_file)
    
    if not success:
        print("\n✗ Normalizzazione fallita")
        sys.exit(1)
    else:
        print("\n✓ Ora puoi usare il file normalizzato con lo script di conversione:")
        print(f"  python3 convert_paintings.py {output_file} Paintings.json")
#!/usr/bin/env python3
"""
Script per normalizzare il file paintings.txt
Rimuove caratteri problematici e standardizza il formato
Uso: python normalize_paintings.py input.txt output.txt
"""

import sys
import re

def normalize_file(input_file, output_file):
    """Normalizza il file di testo rimuovendo caratteri problematici"""
    
    # Prova diverse codifiche per leggere
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'mac-roman']
    content = None
    
    for encoding in encodings:
        try:
            with open(input_file, 'r', encoding=encoding) as f:
                content = f.read()
            print(f"✓ File letto con codifica: {encoding}")
            break
        except:
            continue
    
    if content is None:
        print("✗ Impossibile leggere il file")
        return False
    
    print(f"✓ File letto: {len(content)} caratteri")
    
    # 1. RIMUOVI VIRGOLETTE DAI TITOLI (tutte le varianti)
    # Trova tutti i pattern TITOLO: o TITLE: e rimuovi le virgolette
    content = re.sub(r'(TITOLO:|TITLE:)\s*["""\'Ò Ó]+\s*', r'\1 ', content)
    content = re.sub(r'["""\'ÒÓ]+\s*\n', '\n', content)  # Rimuovi virgolette a fine riga
    
    print(f"✓ Virgolette rimosse dai titoli")
    
    # 2. NORMALIZZA VIRGOLETTE RIMANENTI (per descrizioni, etc)
    replacements = {
        '"': '"',   # Virgoletta doppia curva aperta
        '"': '"',   # Virgoletta doppia curva chiusa
        'Ò': '"',   # Virgoletta storta (codifica sbagliata)
        'Ó': '"',   # Virgoletta storta (codifica sbagliata)
        ''': "'",   # Apostrofo curvo
        ''': "'",   # Apostrofo curvo alternativo
        '–': '-',   # En dash
        '—': '-',   # Em dash
        '…': '...', # Ellipsis
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    print(f"✓ Virgolette e apostrofi normalizzati")
    
    # 3. NORMALIZZA SPAZI MULTIPLI
    content = re.sub(r' +', ' ', content)  # Riduci spazi multipli a uno solo
    
    print(f"✓ Spazi normalizzati")
    
    # 4. NORMALIZZA SEPARATORI ---
    # Assicura che ci sia sempre una riga vuota prima e dopo ---
    content = re.sub(r'\n*---\n*', '\n---\n', content)
    
    print(f"✓ Separatori normalizzati")
    
    # 5. RIMUOVI RIGHE VUOTE MULTIPLE
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    print(f"✓ Righe vuote ridotte")
    
    # 6. ASSICURA CHE IL FILE INIZI PULITO
    content = content.strip() + '\n'
    
    # Scrivi il file normalizzato in UTF-8
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✓✓✓ File normalizzato salvato in: {output_file}")
    print(f"    Caratteri finali: {len(content)}")
    
    # Conta i blocchi
    blocks = content.split('---')
    print(f"    Blocchi trovati: {len(blocks)}")
    print(f"    Dipinti attesi: {len(blocks) // 2}")
    
    return True

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python normalize_paintings.py input.txt output.txt")
        print("\nEsempio:")
        print("  python normalize_paintings.py paintings.txt paintings_clean.txt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    success = normalize_file(input_file, output_file)
    
    if not success:
        print("\n✗ Normalizzazione fallita")
        sys.exit(1)
    else:
        print("\n✓ Ora puoi usare il file normalizzato con lo script di conversione:")
        print(f"  python3 convert_paintings.py {output_file} Paintings.json")
