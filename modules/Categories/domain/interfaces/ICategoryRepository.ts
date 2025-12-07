export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'income' | 'expense';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
  update(id: string, category: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
}
