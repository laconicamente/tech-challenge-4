export interface BalanceFilters {
  userId: string;
}

export interface IBalanceRepository {
  /**
   * Calcula o saldo total baseado nos filtros fornecidos.
   * @param filters - Os critérios para o cálculo.
   * @returns Uma Promise com o valor total do saldo (renda - despesa).
   */
  calculateTotalBalance(filters: BalanceFilters): Promise<number>;
}