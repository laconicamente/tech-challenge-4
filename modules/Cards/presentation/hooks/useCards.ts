import { useAuth } from "@/modules/Users";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Card, CardFilters } from "../../domain/interfaces/ICardRepository";
import {
  addCardUseCase,
  deleteCardUseCase,
  getCardByIdUseCase,
  getCardsUseCase,
  setPrincipalCardUseCase,
  updateCardUseCase,
} from "../../infrastructure/factories/cardFactories";

export async function prefetchCards(
  userId: string,
  filters?: Partial<CardFilters>
): Promise<void> {
  try {
    const cacheKey = `cards:${userId}:${JSON.stringify(filters || {})}`;
    
    const cachedJson = await AsyncStorage.getItem(cacheKey);
    if (cachedJson) {
      const cached = JSON.parse(cachedJson) as Card[];
      if (cached.length > 0) {
        return;
      }
    }

    await getCardsUseCase.execute({
      userId,
      ...filters,
    });
  } catch (error) {
    console.warn('Erro ao pré-carregar cartões:', error);
  }
}

export interface CardsParams {
  initialFilters?: Partial<CardFilters>;
}

export interface CardsResponse {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  filters: CardFilters;
  setFilters: (filters: Partial<CardFilters>) => void;
  refetch: () => Promise<void>;
  addCard: (card: Omit<Card, 'id'>) => Promise<void>;
  updateCard: (id: string, card: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  getCardById: (id: string) => Promise<Card | null>;
  setPrincipalCard: (cardId: string) => Promise<void>;
}

export function useCards(params: CardsParams = {}): CardsResponse {
  const { initialFilters = {} } = params;
  const { user } = useAuth();

  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<CardFilters>({
    userId: user?.uid || '',
    ...initialFilters,
  });

  const setFilters = useCallback((newFilters: Partial<CardFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      userId: user?.uid || prev.userId,
    }));
  }, [user?.uid]);

  const fetchCards = useCallback(async () => {
    if (!user?.uid) {
      setCards([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `cards:${user.uid}:${JSON.stringify(filters)}`;
    
    try {
      const cachedJson = await AsyncStorage.getItem(cacheKey);
      if (cachedJson) {
        const cached = JSON.parse(cachedJson) as Card[];
        if (cached.length > 0) {
          setCards(cached);
          setIsLoading(false);
        }
      }
    } catch (cacheError) {
      console.warn('Erro ao ler cache de cartões:', cacheError);
    }

    const startTime = performance.now();
    setIsLoading(true);
    setError(null);

    try {
      const result = await getCardsUseCase.execute({
        ...filters,
        userId: user.uid,
      });

      const loadTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 5] Tempo de carregamento de cartões: ${loadTime.toFixed(2)}ms (${(loadTime / 1000).toFixed(2)}s) - ${result.length} cartões`);

      setCards(result);

      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (cacheError) {
        console.warn('Erro ao salvar cache de cartões:', cacheError);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
      console.error('Erro ao buscar cartões:', e);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, filters]);

  const refetch = useCallback(async () => {
    if (!user?.uid) return;
    await fetchCards();
  }, [fetchCards, user?.uid]);

  const addCard = useCallback(async (card: Omit<Card, 'id'>) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    const startTime = performance.now();
    try {
      setIsLoading(true);
      await addCardUseCase.execute({
        ...card,
        userId: user.uid,
      });
      const createTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 5] Tempo de criação de cartão: ${createTime.toFixed(2)}ms (${(createTime / 1000).toFixed(2)}s)`);
      
      const cacheKey = `cards:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
      
      await refetch();
    } catch (e) {
      console.error('Erro ao adicionar cartão:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refetch, filters]);

  const updateCard = useCallback(async (id: string, card: Partial<Card>) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    const startTime = performance.now();
    try {
      setIsLoading(true);
      await updateCardUseCase.execute(id, card);
      const updateTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 5] Tempo de atualização de cartão: ${updateTime.toFixed(2)}ms (${(updateTime / 1000).toFixed(2)}s)`);
      
      const cacheKey = `cards:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
      
      await refetch();
    } catch (e) {
      console.error('Erro ao atualizar cartão:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refetch, filters]);

  const deleteCard = useCallback(async (id: string) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    if (!id) {
      throw new Error('ID inválido');
    }

    const startTime = performance.now();
    try {
      setIsLoading(true);
      await deleteCardUseCase.execute(id);
      const deleteTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 5] Tempo de exclusão de cartão: ${deleteTime.toFixed(2)}ms (${(deleteTime / 1000).toFixed(2)}s)`);
      
      const cacheKey = `cards:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
      
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Erro ao excluir cartão:', e);
      const errorMessage = e instanceof Error ? e.message : 'Erro ao excluir cartão';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, filters]);

  const getCardById = useCallback(async (id: string): Promise<Card | null> => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    try {
      return await getCardByIdUseCase.execute(id);
    } catch (e) {
      console.error('Erro ao buscar cartão:', e);
      throw e;
    }
  }, [user?.uid]);

  const setPrincipalCard = useCallback(async (cardId: string) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    try {
      setIsLoading(true);
      await setPrincipalCardUseCase.execute(user.uid, cardId);
      
      const cacheKey = `cards:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
      
      await refetch();
    } catch (e) {
      console.error('Erro ao definir cartão principal:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refetch, filters]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
    addCard,
    updateCard,
    deleteCard,
    getCardById,
    setPrincipalCard,
  };
}
