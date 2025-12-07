import { Category, CategoryRepository } from '../interfaces/ICategoryRepository';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(id: string, category: Partial<Category>): Promise<Category> {
    if (!id || id.trim() === '') {
      throw new Error('O ID da categoria é obrigatório');
    }

    if (category.name !== undefined && category.name.trim() === '') {
      throw new Error('O nome da categoria não pode ser vazio');
    }

    if (category.type !== undefined && !['income', 'expense'].includes(category.type)) {
      throw new Error('O tipo da categoria deve ser income ou expense');
    }

    const updatedCategory = await this.categoryRepository.update(id, category);
    return updatedCategory;
  }
}
