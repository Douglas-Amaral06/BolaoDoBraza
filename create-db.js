#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'palpite10.db');

console.log('📂 Criando banco de dados em:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao criar banco:', err);
    return;
  }

  console.log('✅ Banco criado com sucesso!');

  // Criar tabela
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      cpf TEXT UNIQUE,
      senha TEXT
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela:', err);
      return;
    }

    console.log('✅ Tabela criada com sucesso!');
    console.log('📍 Arquivo: bolao-app/palpite10.db');

    db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar banco:', err);
        return;
      }
      console.log('✅ Done!');
    });
  });
});
