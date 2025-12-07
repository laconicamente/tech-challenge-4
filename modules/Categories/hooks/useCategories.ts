import { useEffect, useState } from 'react';
import { Category } from '../domain/interfaces';
import { createCategoryUseCase, deleteCategoryUseCase, getCategoriesUseCase, updateCategoryUseCase } from '../infrastructure/factories/categoryFactories';

export const useCategories = (type?: 'income' | 'expense') => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategoriesUseCase.execute();
      
      const filteredData = type 
        ? data.filter(category => category.type === type)
        : data;
      
      setCategories(filteredData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const createCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory = await createCategoryUseCase.execute(category);
    
    if (!type || newCategory.type === type) {
      setCategories(prev => [...prev, newCategory]);
    }
    
    return newCategory;
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const updated = await updateCategoryUseCase.execute(id, data);
    
    if (type && updated.type !== type) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
    }
    
    return updated;
  };

  const deleteCategory = async (id: string) => {
    await deleteCategoryUseCase.execute(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
