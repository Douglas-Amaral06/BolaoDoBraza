import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { cadastrarUsuario, validarLogin } from '@/app/Store';

export default function AuthScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (!email || !cpf || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Senha inválida', 'A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    // Tentar cadastrar no Store global
    const cadastroSucesso = cadastrarUsuario(email, cpf, senha);

    if (cadastroSucesso) {
      console.log('✅ Usuário cadastrado:', { email, cpf });
      Alert.alert('Sucesso!', 'Cadastro realizado com sucesso. Faça login agora.');

      setEmail('');
      setCpf('');
      setSenha('');
      setConfirmarSenha('');
      setIsLogin(true);
    } else {
      // Verificar qual foi o erro
      if (email === 'adminpalpite10@gmail.com') {
        Alert.alert('Email já cadastrado', 'Este email já está registrado no sistema.');
      } else {
        // Verificar se foi email ou CPF duplicado
        const { usuariosCadastrados } = require('@/app/Store').dadosGlobais;
        const emailExiste = usuariosCadastrados.find((u: any) => u.email === email);
        const cpfExiste = usuariosCadastrados.find((u: any) => u.cpf === cpf);

        if (emailExiste) {
          Alert.alert('Email já cadastrado', 'Este email já está registrado no sistema.');
        } else if (cpfExiste) {
          Alert.alert('CPF já cadastrado', 'Este CPF já está registrado no sistema.');
        } else {
          Alert.alert('Erro', 'Erro ao criar conta. Tente novamente.');
        }
      }
    }
  };

  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Informe email e senha.');
      return;
    }

    try {
      const resultado = validarLogin(email, senha);

      if (resultado.sucesso) {
        console.log('✅ Login bem-sucedido:', { email, isAdmin: resultado.isAdmin });
        Alert.alert(
          'Bem-vindo!',
          `Login realizado com sucesso${resultado.isAdmin ? ' (Admin)' : ''}!`
        );
        login(email, resultado.isAdmin);
      } else {
        console.log('❌ Login falhou');
        Alert.alert('Credenciais inválidas', 'Email ou senha incorretos.');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="football" size={60} color="#FFD700" />
          <Text style={styles.logo}>Palpite 10</Text>
          <Text style={styles.subtitle}>Seu bolão entre amigos</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Criar Conta</Text>
            </TouchableOpacity>
          </View>

          {isLogin ? (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordBox}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite sua senha"
                  secureTextEntry={!showPassword}
                  value={senha}
                  onChangeText={setSenha}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.mainButton} onPress={handleLogin}>
                <Text style={styles.mainButtonText}>Entrar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu CPF"
                keyboardType="numeric"
                value={cpf}
                onChangeText={setCpf}
                maxLength={14}
              />

              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordBox}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={!showPassword}
                  value={senha}
                  onChangeText={setSenha}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirmar Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Repita a senha"
                secureTextEntry={true}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />

              <TouchableOpacity style={styles.mainButton} onPress={handleRegister}>
                <Text style={styles.mainButtonText}>Criar Conta</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F6B32',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
  },
  logo: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    color: '#DDEEDF',
    fontSize: 15,
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    minHeight: 650,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0F6B32',
    borderRadius: 12,
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFF',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 10,
  },
  passwordBox: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
  },
  mainButton: {
    backgroundColor: '#0F6B32',
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
