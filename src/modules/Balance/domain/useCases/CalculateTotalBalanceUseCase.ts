import { IBalanceRepository } from '../repositories/IBalanceRepository';

export class CalculateTotalBalanceUseCase {
  private readonly balanceRepository: IBalanceRepository;

  constructor(balanceRepository: IBalanceRepository) {
    this.balanceRepository = balanceRepository;
  }

  /**
   * Executa o cálculo do saldo total com validações de negócio
   * @param userId - ID do usuário autenticado
   * @returns Promise com o valor total do saldo
   */
  async execute(userId: string): Promise<number> {
    
    if (!userId) {
      throw new Error("Usuário deve estar autenticado para calcular o saldo.");
    }

    try {
      return await this.balanceRepository.calculateTotalBalance({userId});
    } catch (error) {
      throw new Error(`Ocorreu uma falha ao calcular o saldo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}