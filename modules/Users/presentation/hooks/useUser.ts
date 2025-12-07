import { useState } from 'react';
import { User } from '../../domain/interfaces/IUserRepository';
import { getUserDataUseCase } from '../../infrastructure/factories/userFactories';

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (userId: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await getUserDataUseCase.execute(userId);
      return userData;
    } catch (e: unknown) {
      console.error('Erro ao buscar dados do usuário', e);
      setError((e as Error).message ?? 'Erro desconhecido');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchUserData, isLoading, error };
};
