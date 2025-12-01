import { ITransactionRepository, Transaction } from "../interfaces/ITransactionRepository";

export class UpdateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: string, transaction: Partial<Transaction>): Promise<void> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('ID da transação é obrigatório');
      }

      if (transaction.value !== undefined && transaction.value <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      if (transaction.type && !['income', 'expense'].includes(transaction.type)) {
        throw new Error('Tipo de transação inválido');
      }

      if (transaction.userId) {
        delete transaction.userId;
      }

      await this.transactionRepository.updateTransaction(id, transaction);
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error(`Falha ao atualizar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}