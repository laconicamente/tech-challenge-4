import { TransactionEntity } from "../entities";
import { ITransactionRepository, Transaction } from "../interfaces/ITransactionRepository";

export class UpdateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: string, transaction: Partial<Transaction>): Promise<void> {
      const entity = new TransactionEntity({
              userId: transaction.userId!,
              type: transaction.type!,
              value: transaction.value!,
              categoryId: transaction.categoryId!,
              methodId: transaction.methodId!,
              description: transaction.description,
              createdAt: transaction.createdAt,
              fileUrl: transaction.fileUrl,
            }).create();

      await this.transactionRepository.updateTransaction(id, entity);
  }
}