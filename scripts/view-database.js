#!/usr/bin/env node

/**
 * Script para visualizar o banco de dados SQLite
 * Uso: node scripts/view-database.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// Caminho do banco (mesmo do app)
const dbPath = path.join(os.homedir(), '.local/share/com.example.bolaoapp/palpite10.db');
const dbPathAndroid = path.join(os.homedir(), '.android/data/com.example.bolaoapp/files/palpite10.db');

// Tentar diferentes caminhos
const possiblePaths = [
  dbPath,
  dbPathAndroid,
  path.join(__dirname, '../palpite10.db'),
  path.join(__dirname, '../app/(tabs)/palpite10.db'),
];

console.log('🔍 Procurando banco de dados...\n');

let dbFound = false;

for (const p of possiblePaths) {
  const fs = require('fs');
  if (fs.existsSync(p)) {
    console.log(`✅ Banco encontrado em: ${p}\n`);
    dbFound = true;
    
    const db = new sqlite3.Database(p, (err) => {
      if (err) {
        console.error('❌ Erro ao abrir banco:', err);
        return;
      }

      console.log('📊 === USUÁRIOS CADASTRADOS ===\n');

      db.all('SELECT * FROM usuarios', (err, rows) => {
        if (err) {
          console.error('❌ Erro ao ler dados:', err);
          db.close();
          return;
        }

        if (rows.length === 0) {
          console.log('ℹ️  Nenhum usuário cadastrado ainda.\n');
        } else {
          console.log(`Total de usuários: ${rows.length}\n`);
          console.table(rows);
          console.log('\n');
        }

        // Mostrar estrutura da tabela
        db.all("PRAGMA table_info(usuarios)", (err, columns) => {
          if (!err) {
            console.log('📋 Estrutura da tabela:\n');
            console.table(columns);
          }
          db.close();
        });
      });
    });

    break;
  }
}

if (!dbFound) {
  console.log('❌ Banco de dados não encontrado em nenhum dos caminhos possíveis:\n');
  possiblePaths.forEach(p => console.log(`   • ${p}`));
  console.log('\n💡 Execute o app primeiro para criar o banco.\n');
}
