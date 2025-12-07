import { useAuth } from "@/modules/Users";
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

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCardsUseCase.execute({
        ...filters,
        userId: user.uid,
      });

      setCards(result);
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

    try {
      setIsLoading(true);
      await addCardUseCase.execute({
        ...card,
        userId: user.uid,
      });
      await refetch();
    } catch (e) {
      console.error('Erro ao adicionar cartão:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refetch]);

  const updateCard = useCallback(async (id: string, card: Partial<Card>) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    try {
      setIsLoading(true);
      await updateCardUseCase.execute(id, card);
      await refetch();
    } catch (e) {
      console.error('Erro ao atualizar cartão:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refetch]);

  const deleteCard = useCallback(async (id: string) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    if (!id) {
      throw new Error('ID inválido');
    }

    try {
      setIsLoading(true);
      await deleteCardUseCase.execute(id);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Erro ao excluir cartão:', e);
      const errorMessage = e instanceof Error ? e.message : 'Erro ao excluir cartão';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

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
      await refetch();
    } catch (e) {
      console.error('Erro ao definir cartão principal:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refetch]);

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
