#!/usr/bin/env python3

import sqlite3
import os
import json
from pathlib import Path

print('\n🔍 Procurando banco de dados Expo...\n')

# No Expo, o banco fica em documentDirectory
# Vamos procurar em locais típicos
search_paths = [
    # Projeto local
    'palpite10.db',
    
    # Expo Go (Windows)
    os.path.expanduser('~/.local/share/Expo.Expo/palpite10.db'),
    os.path.expanduser('~/AppData/Local/Expo.Expo/palpite10.db'),
    
    # Android Emulador
    os.path.expanduser('~/.android/data/host.exp.exponent/files/palpite10.db'),
    
    # Procurar recursivamente
    '/data/data/host.exp.exponent/files/palpite10.db',
]

db_path = None

# Procurar arquivo
for path in search_paths:
    expanded_path = os.path.expanduser(path)
    if os.path.exists(expanded_path):
        db_path = expanded_path
        print(f'✅ Banco encontrado em: {expanded_path}\n')
        break

# Se não encontrou, procurar recursivamente no home
if not db_path:
    print('🔎 Procurando recursivamente...\n')
    home = os.path.expanduser('~')
    for root, dirs, files in os.walk(home):
        if 'palpite10.db' in files:
            db_path = os.path.join(root, 'palpite10.db')
            print(f'✅ Banco encontrado em: {db_path}\n')
            break
        # Limitar profundidade
        if root.count(os.sep) - home.count(os.sep) > 5:
            dirs[:] = []

if not db_path:
    print('❌ Banco não encontrado!\n')
    print('💡 Soluções:')
    print('   1. Execute o app e crie um novo usuário')
    print('   2. O banco será criado automaticamente no Expo')
    print('   3. Execute novamente este script\n')
    print('📍 Locais procurados:')
    for path in search_paths:
        print(f'   • {os.path.expanduser(path)}')
    print()
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Verificar se a tabela existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'")
    if not cursor.fetchone():
        print('❌ Tabela usuarios não existe\n')
        conn.close()
        exit(1)

    # Buscar todos os usuários
    cursor.execute('SELECT * FROM usuarios')
    usuarios = cursor.fetchall()

    print('='*80)
    print('📊 BANCO DE DADOS - Palpite 10')
    print('='*80)
    print(f'\n👥 Total de usuários: {len(usuarios)}\n')

    if len(usuarios) == 0:
        print('ℹ️  Nenhum usuário cadastrado ainda.\n')
    else:
        print(f"{'ID':<5} {'Email':<35} {'CPF':<15} {'Senha':<15}")
        print('-'*80)
        for user in usuarios:
            user_id, email, cpf, senha = user
            print(f"{user_id:<5} {email:<35} {cpf:<15} {senha:<15}")
        print('\n')

    conn.close()

except sqlite3.Error as e:
    print(f'❌ Erro ao acessar banco: {e}\n')
    exit(1)

print('='*80 + '\n')
