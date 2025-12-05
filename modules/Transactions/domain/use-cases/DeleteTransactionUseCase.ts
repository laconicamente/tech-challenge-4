import { ITransactionRepository } from "../interfaces/ITransactionRepository";

export class DeleteTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: string): Promise<void> {
      if (!id || id.trim() === '') {
        throw new Error('ID da transação é obrigatório');
      }

      await this.transactionRepository.deleteTransaction(id);      
  }
}