# Arquitetura de Controle de Acesso Global

## 📐 Estrutura Implementada

### 1. **Contexto de Autenticação** (`contexts/AuthContext.tsx`)
- Gerencia estado global de autenticação
- Persiste dados com `AsyncStorage`
- Valida sessão ao iniciar o app
- Métodos: `login()`, `logout()`, `useAuth()`

### 2. **Fluxo de Autenticação**

```
┌─────────────────────────────────────┐
│   App inicia (app/_layout.tsx)      │
├─────────────────────────────────────┤
│  AuthProvider envolve a aplicação   │
├─────────────────────────────────────┤
│  RootLayoutContent verifica estado  │
├─────────────────────────────────────┤
│          Lógica Gate-keeper:        │
│                                     │
│  ✗ isLoggedIn? → LoginScreen       │
│  ✓ isLoggedIn? → App (Tabs)        │
│  ✓ isAdmin?    → Admin Tab Extra   │
└─────────────────────────────────────┘
```

### 3. **Telas Principais**

#### `LoginScreen` (app/(tabs)/Login.tsx)
- Única tela vista antes da autenticação
- Aceita login/cadastro
- Chama `login()` do contexto após validação
- Mantém autenticação global

#### `AdminPanel` (app/(tabs)/AdminPanel.tsx)
- Aba exclusiva para admins
- Gerencia usuários
- Promove/remove privilégios admin
- Apenas `adminpalpite10@gmail.com` pode remover admins

#### `Home` (app/(tabs)/index.tsx)
- Tela principal do app
- Só renderiza se autenticado

### 4. **Persistência de Sessão**

**Dados salvos (AsyncStorage):**
- `userEmail` - Email do usuário logado
- `isAdmin` - Flag de privilégio admin

**Na reinicialização:**
1. AuthContext verifica AsyncStorage
2. Valida se usuário ainda existe no banco
3. Restaura autenticação automaticamente
4. Usuário não precisa logar novamente

### 5. **Uso do Hook `useAuth()`**

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function MeuComponente() {
  const { isLoggedIn, isAdmin, userEmail, login, logout } = useAuth();
  
  // Componente só renderiza se isLoggedIn === true
  return <View>...</View>;
}
```

### 6. **Logout**

Limpa:
- AsyncStorage
- Estado global (isLoggedIn, isAdmin)
- Redireciona para LoginScreen

---

## 🎨 Identidade Visual Mantida

- **Cor Principal:** Verde `#0F6B32`
- **Cor Secundária:** Ouro `#FFD700`
- **Cor Secundária:** Branco `#FFF`
- Transições suaves entre telas

---

## 🔒 Segurança

- Autenticação validada contra banco de dados
- Permissões granulares (apenas admin principal remove admins)
- Sessão invalidada se usuário for deletado do banco
- Dados sensíveis não expostos desnecessariamente

---

## 📦 Dependências Adicionadas

```json
"@react-native-async-storage/async-storage": "^1.23.1"
```

---

## ✅ Checklist de Implementação

- [x] Contexto de autenticação global
- [x] Gate-keeper no componente raiz
- [x] Persistência com AsyncStorage
- [x] LoginScreen como tela inicial
- [x] Admin Panel como aba condicional
- [x] Logout com limpeza completa
- [x] Identidade visual mantida
- [x] Validação de permissões

---

## 🚀 Próximos Passos (Sugestões)

1. Implementar refresh token (se usando API)
2. Adicionar biometria (Touch/Face ID)
3. Notificações de logout em outro dispositivo
4. Histórico de login
5. Recuperação de senha

