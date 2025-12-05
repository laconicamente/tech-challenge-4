import { TransactionEntity } from "../entities/Transaction";
import { ITransactionRepository, TransactionFilters } from "../interfaces/ITransactionRepository";

export class CalculateBalanceUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(filters: TransactionFilters): Promise<number> {
      const { transactions } = await this.transactionRepository.getTransactionsByUser({
        userId: filters.userId
      });

      let totalBalance = 0;

      transactions.forEach(data => {
        const transaction = new TransactionEntity(data);
        
        if (transaction.isIncome()) {
          totalBalance += transaction.value;
        } else if (transaction.isExpense()) {
          totalBalance -= transaction.value;
        }
      });

      return totalBalance / 100 || 0;
  }
}