export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  value: number;
  description?: string;
  createdAt?: Date;
}

export interface TransactionFilters {
  userId: string;
}

export interface ITransactionRepository {
  /**
   * Busca todas as transações de um usuário
   * @param filters - Filtros incluindo userId obrigatório
   * @returns Promise com array de transações
   */
  getTransactionsByUser(filters: TransactionFilters): Promise<Transaction[]>;
}