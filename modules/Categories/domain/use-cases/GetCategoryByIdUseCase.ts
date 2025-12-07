import { Category, CategoryRepository } from '../interfaces/ICategoryRepository';

export class GetCategoryByIdUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<Category | null> {
    if (!id || id.trim() === '') {
      throw new Error('O ID da categoria é obrigatório');
    }

    const category = await this.categoryRepository.getById(id);
    return category;
  }
}
