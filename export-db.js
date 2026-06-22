#!/usr/bin/env node

/**
 * Script para exportar e visualizar o banco de dados
 * Executa quando o app inicia
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Caminho local do projeto
const projectRoot = __dirname;
const dbDir = path.join(projectRoot, 'data');
const dbPath = path.join(dbDir, 'palpite10.db');

// Criar diretório se não existir
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📂 Diretório criado: ${dbDir}`);
}

console.log(`\n📍 Banco de dados: ${dbPath}\n`);

module.exports = { dbPath, dbDir };
