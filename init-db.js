#!/usr/bin/env node

/**
 * Script para criar banco de dados SQLite válido
 * Executa: node init-db.js
 */

const fs = require('fs');
const path = require('path');

// Usar better-sqlite3 que já vem com Expo
try {
  const Database = require('better-sqlite3');
  
  const dbPath = path.join(__dirname, 'palpite10.db');
  
  console.log('📂 Criando banco em:', dbPath);
  
  const db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      cpf TEXT UNIQUE,
      senha TEXT
    )
  `);
  
  console.log('✅ Banco criado com sucesso!');
  console.log('📍 Arquivo: bolao-app/palpite10.db');
  console.log('📊 Tabela: usuarios');
  
  db.close();
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  console.log('\n💡 Alternativa: Execute o app uma vez para criar o banco automaticamente');
}
