import { Category, CategoryRepository } from '../interfaces/ICategoryRepository';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    const categories = await this.categoryRepository.getAll();
    return categories;
  }
}
