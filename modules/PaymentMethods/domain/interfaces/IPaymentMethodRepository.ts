export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'pix' | 'bank_transfer' | 'other';
  cardId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentMethodRepository {
  getAll(): Promise<PaymentMethod[]>;
  getById(id: string): Promise<PaymentMethod | null>;
  create(method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod>;
  update(id: string, method: Partial<PaymentMethod>): Promise<PaymentMethod>;
  delete(id: string): Promise<void>;
}
