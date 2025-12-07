import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  UpdateCategoryUseCase,
} from '../../domain/use-cases';
import { FirebaseCategoryRepository } from '../repositories/CategoryRepository';

const categoryRepository = new FirebaseCategoryRepository();

export const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
export const getCategoryByIdUseCase = new GetCategoryByIdUseCase(categoryRepository);
export const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
export const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
export const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
