export interface WidgetCategoryItem {
  id?: string;
  name: string;
  value: number;
  color?: string;
  icon?: string;
}

export interface FinancialResumeData {
  totalValue: number;
  data: { timestamp: number; value: number }[];
}

export interface AnalysisMonthlyData {
  monthExpense: number;
  monthIncome: number;
  differenceValue: number;
  totalValue: number;
}

export interface IWidgetRepository {
  /**
   * Busca gastos agrupados por categoria
   * @param userId - ID do usuário
   * @returns Promise com array de itens de categoria
   */
  fetchSpendingByCategory(userId: string): Promise<WidgetCategoryItem[]>;

  /**
   * Busca as 3 maiores entradas por categoria
   * @param userId - ID do usuário
   * @returns Promise com array de itens de categoria (top 3)
   */
  fetchBiggestEntries(userId: string): Promise<WidgetCategoryItem[]>;

  /**
   * Busca resumo financeiro por período
   * @param type - Tipo de transação (income ou expense)
   * @param userId - ID do usuário
   * @param start - Data inicial
   * @param end - Data final
   * @returns Promise com dados do resumo financeiro
   */
  fetchFinancialResume(
    type: "income" | "expense",
    userId: string,
    start: Date,
    end: Date
  ): Promise<FinancialResumeData>;

  /**
   * Busca análise mensal dos últimos 30 dias
   * @param userId - ID do usuário
   * @returns Promise com dados da análise mensal
   */
  fetchAnalysisMonthly(userId: string): Promise<AnalysisMonthlyData>;
}
