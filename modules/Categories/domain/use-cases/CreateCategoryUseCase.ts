import { Category, CategoryRepository } from '../interfaces/ICategoryRepository';

export class CreateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    if (!category.name || category.name.trim() === '') {
      throw new Error('O nome da categoria é obrigatório');
    }

    if (!category.type || !['income', 'expense'].includes(category.type)) {
      throw new Error('O tipo da categoria deve ser income ou expense');
    }

    const newCategory = await this.categoryRepository.create(category);
    return newCategory;
  }
}
