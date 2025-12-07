import { FinancialResumeData, IWidgetRepository } from "../interfaces/IWidgetRepository";

export class FetchFinancialResumeUseCase {
  constructor(private widgetRepository: IWidgetRepository) {}

  async execute(
    type: "income" | "expense",
    userId: string,
    start: Date,
    end: Date
  ): Promise<FinancialResumeData> {
    if (!userId || userId.trim() === '') {
      throw new Error('O id do usuário é obrigatório');
    }

    if (!start || !end) {
      throw new Error('As datas de início e fim são obrigatórias');
    }

    if (start > end) {
      throw new Error('A data de início deve ser anterior à data de fim');
    }

    return await this.widgetRepository.fetchFinancialResume(type, userId, start, end);
  }
}
