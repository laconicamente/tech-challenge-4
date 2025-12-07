import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../../domain/interfaces/IUserRepository';
import {
    getUserDataUseCase,
    loginUseCase,
    logoutUseCase,
    signUpUseCase,
    updateUserUseCase,
} from '../../infrastructure/factories/userFactories';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const userRepository = new UserRepository();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = userRepository.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      setIsAuthenticated(!!currentUser);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginUseCase.execute({ email, password });
      return true;
    } catch (error) {
      console.error('Erro de login:', error);
      return false;
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    try {
      await signUpUseCase.execute({ name, email, password });
    } catch (error) {
      console.error('Erro de cadastro:', error);
      throw error;
    }
  };

  const reloadUser = async () => {
    try {
      await userRepository.reloadUser();
      const currentUser = userRepository.getCurrentUser();
      if (currentUser) {
        const userData = await getUserDataUseCase.execute(currentUser.uid);
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao recarregar usuário:', error);
    }
  };

  const logout = async (): Promise<void> => {
    await logoutUseCase.execute();
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado.');

      await updateUserUseCase.execute(user.uid, userData);
      await reloadUser();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signUp,
    logout,
    updateUser,
    isAuthenticated,
    reloadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('O hook useAuth() deve ser usado dentro de um AuthProvider.');
  }
  return context;
};
