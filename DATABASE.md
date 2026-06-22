# 📊 Banco de Dados - Palpite 10

## Localização do Banco

O banco de dados SQLite (`palpite10.db`) é criado automaticamente quando o app é executado pela primeira vez.

### Caminho do Banco no Projeto
```
/bolao-app/data/palpite10.db
```

> ⚠️ **Segurança**: O arquivo `.db` está no `.gitignore` para evitar exposição de dados sensíveis (senhas).

---

## 📋 Estrutura da Tabela

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  cpf TEXT UNIQUE,
  senha TEXT
)
```

---

## 🔍 Como Visualizar os Dados

### Opção 1: Via Console (Recomendado)
Ao executar o app, você verá logs no console:

```
✅ Tabela criada/verificada
📍 Caminho do banco: /Users/seu-usuario/.../palpite10.db
👥 Usuários cadastrados: 2
📊 Dados: [...]
```

### Opção 2: Abrir com SQLite Browser (GUI)
1. Baixe [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Abra o arquivo: `bolao-app/data/palpite10.db`
3. Visualize as tabelas e dados

### Opção 3: Linha de Comando
```bash
# Instalar sqlite3 (se não tiver)
# macOS
brew install sqlite3

# Abrir banco
sqlite3 bolao-app/data/palpite10.db

# Comandos úteis
.tables                           # Listar tabelas
.schema usuarios                  # Ver estrutura
SELECT * FROM usuarios;           # Ver todos os usuários
SELECT * FROM usuarios WHERE email LIKE '%@gmail.com'; # Filtrar
```

---

## 📝 Exemplo de Dados

```
id | email              | cpf           | senha
---|-------------------|---------------|----------
1  | joao@gmail.com    | 12345678901   | senha123
2  | maria@gmail.com   | 98765432109   | pass456
```

---

## 🧪 Testar o App

1. **Criar Conta**
   - Email: `teste@example.com`
   - CPF: `12345678901`
   - Senha: `senha123`

2. **Verificar no Console**
   ```
   ✅ Usuário cadastrado: { email: 'teste@example.com', cpf: '12345678901' }
   ```

3. **Fazer Login**
   - Use o email e senha cadastrados

4. **Visualizar no Banco**
   ```bash
   sqlite3 bolao-app/data/palpite10.db "SELECT * FROM usuarios;"
   ```

---

## 🚀 Próximos Passos

- [ ] Criar login Admin para gerenciar usuários
- [ ] Adicionar criptografia de senha (bcrypt)
- [ ] Criar backup automático do banco
- [ ] Adicionar mais tabelas (apostas, resultados, etc.)

---

## ⚠️ Segurança

- ✅ Banco em `.gitignore` (não commita em Git)
- ⚠️ Senhas são armazenadas em plain text (usar bcrypt em produção)
- ✅ Validação de email/cpf duplicados
- ✅ Isolado do app (dados seguros)

