import { IWidgetRepository, WidgetCategoryItem } from "../interfaces/IWidgetRepository";

export class FetchSpendingByCategoryUseCase {
  constructor(private widgetRepository: IWidgetRepository) {}

  async execute(userId: string): Promise<WidgetCategoryItem[]> {
    if (!userId || userId.trim() === '') {
      throw new Error('O id do usuário é obrigatório');
    }

    return await this.widgetRepository.fetchSpendingByCategory(userId);
  }
}
