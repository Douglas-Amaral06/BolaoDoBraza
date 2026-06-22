import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { limparTodosDados } from '@/app/Store';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail: string;
  isLoading: boolean;
  login: (email: string, isAdmin: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se o usuário já está autenticado ao iniciar o app
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedIsAdmin = await AsyncStorage.getItem('isAdmin');

        if (storedEmail) {
          // Restaurar sessão do AsyncStorage
          setIsLoggedIn(true);
          setUserEmail(storedEmail);
          setIsAdmin(storedIsAdmin === 'true');
          console.log('✅ Usuário restaurado da sessão:', storedEmail);
        }
      } catch (e) {
        console.error('❌ Erro ao restaurar sessão:', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, isAdminUser: boolean) => {
    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('isAdmin', isAdminUser.toString());
      setIsLoggedIn(true);
      setUserEmail(email);
      setIsAdmin(isAdminUser);
      console.log('✅ Login realizado:', { email, isAdmin: isAdminUser });
    } catch (e) {
      console.error('❌ Erro ao salvar sessão:', e);
    }
  };

  const logout = async () => {
    try {
      // Limpar dados temporários da Store
      limparTodosDados();
      
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('isAdmin');
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserEmail('');
      console.log('✅ Logout realizado');
    } catch (e) {
      console.error('❌ Erro ao fazer logout:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, userEmail, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
