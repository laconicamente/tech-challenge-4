import { TransactionEntity } from "../entities";
import { ITransactionRepository, Transaction } from "../interfaces/ITransactionRepository";

export class AddTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(transaction: Omit<Transaction, 'id'>): Promise<string> {
      const entity = new TransactionEntity({
        userId: transaction.userId!,
        type: transaction.type,
        value: transaction.value,
        categoryId: transaction.categoryId,
        methodId: transaction.methodId,
        description: transaction.description,
        createdAt: transaction.createdAt,
        fileUrl: transaction.fileUrl,
      }).create();

      const transactionId = await this.transactionRepository.addTransaction(entity);
      
      return transactionId;
  }
}