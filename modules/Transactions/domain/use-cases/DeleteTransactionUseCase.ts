import { ITransactionRepository } from "../interfaces/ITransactionRepository";

export class DeleteTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: string): Promise<void> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('ID da transação é obrigatório');
      }

      await this.transactionRepository.deleteTransaction(id);
      
    } catch (error) {
      throw new Error(`Falha ao excluir transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}