import { ITransactionRepository, TransactionFilters } from "../interfaces/ITransactionRepository";

export class CalculateBalanceUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(filters: TransactionFilters): Promise<number> {
    try {
      const transactions = await this.transactionRepository.getTransactionsByUser({
        userId: filters.userId
      });

      let totalBalance = 0;

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalBalance += transaction.value;
        } else if (transaction.type === 'expense') {
          totalBalance -= transaction.value;
        }
      });

      return totalBalance / 100 || 0;
      
    } catch (error) {
      console.error('Error calculating total balance:', error);
      throw new Error(`Falha ao calcular saldo total: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}