import { AnalysisMonthlyData, IWidgetRepository } from "../interfaces/IWidgetRepository";

export class FetchAnalysisMonthlyUseCase {
  constructor(private widgetRepository: IWidgetRepository) {}

  async execute(userId: string): Promise<AnalysisMonthlyData> {
    if (!userId || userId.trim() === '') {
      throw new Error('O id do usuário é obrigatório');
    }

    return await this.widgetRepository.fetchAnalysisMonthly(userId);
  }
}
