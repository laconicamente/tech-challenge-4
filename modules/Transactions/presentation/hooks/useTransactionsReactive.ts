import { useAuth } from "@/modules/Users";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Transaction, TransactionFilters } from "../../domain/interfaces/ITransactionRepository";
import {
    addTransactionUseCase,
    deleteTransactionUseCase,
    transactionRepository,
    updateTransactionUseCase,
} from "../../infrastructure/factories/transactionFactories";

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

export function useTransactionsReactive(
  params: TransactionsParams = {}
): TransactionsResponse {
  const { initialFilters = {}, pageSize = 10 } = params;
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore] = useState(false);
  const [filters, setFiltersState] = useState<TransactionFilters>({
    userId: user?.uid || '',
    ...initialFilters,
  });

  const setFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      userId: user?.uid || prev.userId,
    }));
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
    
    (async () => {
      try {
        const cachedJson = await AsyncStorage.getItem(cacheKey);
        if (cachedJson) {
          const cached = JSON.parse(cachedJson) as Transaction[];
          if (cached.length > 0) {
            setTransactions(cached);
            setIsLoading(false);
          }
        }
      } catch {
      }
    })();

    const unsubscribe = transactionRepository.subscribeTransactions(
      {
        ...filters,
        userId: user.uid,
        pageSize,
      },
      (txs: Transaction[]) => {
        setTransactions(txs);
        setIsLoading(false);
        
        const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
        AsyncStorage.setItem(cacheKey, JSON.stringify(txs)).catch(() => {});
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid, filters, pageSize]);

  const refetch = useCallback(async () => {
    if (!user?.uid) return;
    
    const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
    try {
      await AsyncStorage.removeItem(cacheKey);
    } catch {
    }
    
    setIsLoading(true);
    setError(null);
  }, [user?.uid, filters]);

  const loadMore = useCallback(async () => {
    console.warn('loadMore não está disponível em modo reativo. Use useTransactions para paginação.');
  }, []);

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
      console.log(`[Performance - Cenário 4] Tempo de criação de transação (reativo): ${createTime.toFixed(2)}ms (${(createTime / 1000).toFixed(2)}s)`);
      
      const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
    } catch (e) {
      console.error('Erro ao adicionar transação:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, filters]);

  const updateTransaction = useCallback(async (id: string, transaction: Partial<Transaction>) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado para esta operação.');
    }

    const startTime = performance.now();
    try {
      setIsLoading(true);
      await updateTransactionUseCase.execute(id, transaction);
      const updateTime = performance.now() - startTime;
      console.log(`[Performance - Cenário 4] Tempo de atualização de transação (reativo): ${updateTime.toFixed(2)}ms (${(updateTime / 1000).toFixed(2)}s)`);
      
      const cacheKey = `transactions:${user.uid}:${JSON.stringify(filters)}`;
      try {
        await AsyncStorage.removeItem(cacheKey);
      } catch {
      }
    } catch (e) {
      console.error('Erro ao atualizar transação:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, filters]);

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
      console.log(`[Performance - Cenário 4] Tempo de exclusão de transação (reativo): ${deleteTime.toFixed(2)}ms (${(deleteTime / 1000).toFixed(2)}s)`);
      
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

