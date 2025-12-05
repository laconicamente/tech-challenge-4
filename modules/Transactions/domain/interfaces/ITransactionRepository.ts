export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  userId?: string;
  type: TransactionType;
  value: number;
  categoryId: string;
  methodId: string;
  description?: string;
  createdAt?: Date;
  categoryName?: string | null;
  methodName?: string | null;
  createdAtDisplay?: string;
  fileUrl?: string;
}

export interface TransactionFilters {
  userId: string;
  categoryId?: string;
  methodId?: string;
  startDate?: string;
  endDate?: string;
  minValue?: number;
  maxValue?: number;
  pageSize?: number;
  lastDocId?: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  lastDocId?: string;
  hasMore: boolean;
}

export interface ITransactionRepository {
  /**
   * Busca todas as transações de um usuário com filtros e paginação
   * @param filters - Filtros incluindo userId obrigatório
   * @returns Promise com transações paginadas
   */
  getTransactionsByUser(filters: TransactionFilters): Promise<PaginatedTransactions>;

  /**
   * Adiciona uma nova transação
   * @param transaction - Dados da transação
   * @returns Promise com o ID da transação criada
   */
  addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string>;

  /**
   * Atualiza uma transação existente
   * @param id - ID da transação
   * @param transaction - Dados parciais para atualizar
   * @returns Promise void
   */
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void>;

  /**
   * Deleta uma transação
   * @param id - ID da transação
   * @returns Promise void
   */
  deleteTransaction(id: string): Promise<void>;
}