import { CategoryRepository } from '../interfaces/ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('O ID da categoria é obrigatório');
    }

    await this.categoryRepository.delete(id);
  }
}
