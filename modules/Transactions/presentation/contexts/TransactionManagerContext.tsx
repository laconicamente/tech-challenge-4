import React, { createContext, useContext, useState } from "react";
import { TransactionFilters } from "../../domain/interfaces/ITransactionRepository";
import { useBalanceValue } from "../hooks/useBalanceValue";
import { TransactionsResponse, useTransactions } from "../hooks/useTransactions";
import { useTransactionsReactive } from "../hooks/useTransactionsReactive";

export interface TransactionManagerProps extends TransactionsResponse {
  balanceValue: number;
  isLoadingBalance: boolean;
  isBalanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  refetchBalanceValue: () => Promise<void>;
}

export interface TransactionProviderProps {
  children: React.ReactNode;
  initialFilters?: Partial<TransactionFilters>;
  pageSize?: number;
  useReactive?: boolean;
}
const TransactionManager = createContext<TransactionManagerProps | undefined>(undefined);

export const TransactionManagerProvider: React.FC<TransactionProviderProps> = ({ 
  children,
  initialFilters = {},
  pageSize = 10,
  useReactive = false
}) => {
  const reactiveData = useTransactionsReactive({ initialFilters, pageSize });
  const traditionalData = useTransactions({ initialFilters, pageSize });
  
  const transactionsData = useReactive ? {
    ...reactiveData,
    addTransaction: traditionalData.addTransaction,
    updateTransaction: traditionalData.updateTransaction,
    deleteTransaction: traditionalData.deleteTransaction,
    loadMore: traditionalData.loadMore,
    isLoadingMore: traditionalData.isLoadingMore,
    hasMore: traditionalData.hasMore,
  } : traditionalData;
  
  const { total: balanceValue, isLoadingBalance, refetchBalanceValue } = useBalanceValue();
  const [isBalanceVisible, setBalanceVisible] = useState(false);

  return (
    <TransactionManager.Provider
      value={{
        ...transactionsData,
        balanceValue,
        isLoadingBalance,
        isBalanceVisible,
        setBalanceVisible,
        refetchBalanceValue,
      }}
    >
      {children}
    </TransactionManager.Provider>
  );
};

export const useTransactionManager = () => {
  const context = useContext(TransactionManager);
  if (!context) {
    throw new Error('O contexto useTransaction precisa estar dentro do TransactionProvider.');
  }
  return context;
};