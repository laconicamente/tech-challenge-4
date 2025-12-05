import { ITransactionRepository, PaginatedTransactions, TransactionFilters } from "../interfaces/ITransactionRepository";

export class GetTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(filters: TransactionFilters): Promise<PaginatedTransactions> {
      if (!filters.userId || filters.userId.trim() === '') {
        throw new Error('O id do usuário é obrigatório para buscar transações');
      }

      if (filters.minValue !== undefined && filters.maxValue !== undefined) {
        if (filters.minValue > filters.maxValue) {
          [filters.minValue, filters.maxValue] = [filters.maxValue, filters.minValue];
        }
      }

      const result = await this.transactionRepository.getTransactionsByUser(filters);
      
      return result;
  }
}