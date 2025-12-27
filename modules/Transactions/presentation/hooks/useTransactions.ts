import { useAuth } from "@/modules/Users";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaginatedTransactions, Transaction, TransactionFilters } from "../../domain/interfaces/ITransactionRepository";
import {
  addTransactionUseCase,
  deleteTransactionUseCase,
  getTransactionsUseCase,
  updateTransactionUseCase,
} from "../../infrastructure/factories/transactionFactories";

export async function prefetchTransactions(
  userId: string,
  filters?: Partial<TransactionFilters>,
  pageSize: number = 10
): Promise<void> {
  try {
    const cacheKey = `transactions:${userId}:${JSON.stringify(filters || {})}`;
    
    const cachedJson = await AsyncStorage.getItem(cacheKey);
    if (cachedJson) {
      const cached = JSON.parse(cachedJson) as Transaction[];
      if (cached.length > 0) {
        return;
      }
    }

    await getTransactionsUseCase.execute({
      userId,
      pageSize,
      ...filters,
    });
  } catch (error) {
    console.warn('Erro ao pré-carregar transações:', error);
  }
}

export interface TransactionsParams {
  initialFilters?: Partial<TransactionFilters>;
  pageSize?: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  filters: TransactionFilters;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export function useTransactions(
  params: TransactionsParams = {}
): TransactionsResponse {
  const { initialFilters = {}, pageSize = 10 } = params;
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFiltersState] = useState<TransactionFilters>({
    userId: user?.uid || '',
    ...initialFilters,
  });

  const lastDocIdRef = useRef<string | undefined>(undefined);

  const setFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      userId: user?.uid || prev.userId,
    }));
  }, [user?.uid]);

  const fetchFirstPage = useCallback(async () => {
    if (!user?.uid) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
    
    try {
      const cachedJson = await AsyncStorage.getItem(cacheKey);
      if (cachedJson) {
        const cached = JSON.parse(cachedJson) as Transaction[];
        if (cached.length > 0) {
          setTransactions(cached);
          setIsLoading(false);
        }
      }
    } catch (cacheError) {
      console.warn('Erro ao ler cache de transações:', cacheError);
    }

    const startTime = performance.now();
    setIsLoading(true);
    setError(null);
    setHasMore(true);
    lastDocIdRef.current = undefined;

    try {
      const result: PaginatedTransactions = await getTransactionsUseCase.execute({
        ...filters,
        userId: user.uid,
        pageSize,
      });

      const loadTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 3] Tempo de carregamento da primeira página de transações: ${loadTime.toFixed(2)}ms (${(loadTime / 1000).toFixed(2)}s) - ${result.transactions.length} itens`);

      setTransactions(result.transactions);
      setHasMore(result.hasMore);
      lastDocIdRef.current = result.lastDocId;

      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(result.transactions));
      } catch (cacheError) {
        console.warn('Erro ao salvar cache de transações:', cacheError);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
      console.error('Erro ao buscar transações:', e);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, filters, pageSize]);

  const loadMore = useCallback(async () => {
    if (!user?.uid || !hasMore || isLoadingMore || isLoading) return;

    const startTime = performance.now();
    setIsLoadingMore(true);

    try {
      const result: PaginatedTransactions = await getTransactionsUseCase.execute({
        ...filters,
        userId: user.uid,
        pageSize,
        lastDocId: lastDocIdRef.current,
      });

      if (result.transactions.length === 0) {
        setHasMore(false);
        return;
      }

      const loadTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 3] Tempo de paginação (loadMore) de transações: ${loadTime.toFixed(2)}ms (${(loadTime / 1000).toFixed(2)}s) - ${result.transactions.length} novos itens`);

      setTransactions(prev => [...prev, ...result.transactions]);
      setHasMore(result.hasMore);
      lastDocIdRef.current = result.lastDocId;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Erro ao carregar mais transações';
      console.error('Erro ao carregar mais transações:', e);
      setError(errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [user?.uid, hasMore, isLoadingMore, isLoading, filters, pageSize]);

  const refetch = useCallback(async () => {
    if (!user?.uid) return;
    await fetchFirstPage();
  }, [fetchFirstPage, user?.uid]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    const startTime = performance.now();
    try {
      setIsLoading(true);
      await addTransactionUseCase.execute({
        ...transaction,
        userId: user.uid,
      });
      const createTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 4] Tempo de criação de transação: ${createTime.toFixed(2)}ms (${(createTime / 1000).toFixed(2)}s)`);
      
      const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
      
      await refetch();
    } catch (e) {
      console.error('Erro ao adicionar transação:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refetch, filters]);

  const updateTransaction = useCallback(async (id: string, transaction: Partial<Transaction>) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    const startTime = performance.now();
    try {
      setIsLoading(true);
      await updateTransactionUseCase.execute(id, transaction);
      const updateTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 4] Tempo de atualização de transação: ${updateTime.toFixed(2)}ms (${(updateTime / 1000).toFixed(2)}s)`);
      
      const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
      
      await refetch();
    } catch (e) {
      console.error('Erro ao atualizar transação:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refetch, filters]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    if (!id) {
      throw new Error('ID inválido');
    }

    const startTime = performance.now();
    try {
      setIsLoading(true);
      await deleteTransactionUseCase.execute(id);
      const deleteTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 4] Tempo de exclusão de transação: ${deleteTime.toFixed(2)}ms (${(deleteTime / 1000).toFixed(2)}s)`);
      
      const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
      
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error('Erro ao excluir transação:', e);
      const errorMessage = e instanceof Error ? e.message : 'Erro ao excluir transação';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, filters]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  return {
    transactions,
    isLoading,
    isLoadingMore,
    error,
    filters,
    setFilters,
    refetch,
    loadMore,
    hasMore,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}