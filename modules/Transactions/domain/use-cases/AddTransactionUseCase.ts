import { ITransactionRepository, Transaction } from "../interfaces/ITransactionRepository";

export class AddTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      if (!transaction.userId) {
        throw new Error('O id do usuário é obrigatório');
      }

      if (!transaction.categoryId) {
        throw new Error('Categoria é obrigatória');
      }

      if (!transaction.methodId) {
        throw new Error('Método de pagamento é obrigatório');
      }

      if (!transaction.value || transaction.value <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      if (!['income', 'expense'].includes(transaction.type)) {
        throw new Error('Tipo de transação inválido');
      }

      const transactionId = await this.transactionRepository.addTransaction(transaction);
      
      return transactionId;
      
    } catch (error) {
      throw new Error(`Falha ao adicionar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}